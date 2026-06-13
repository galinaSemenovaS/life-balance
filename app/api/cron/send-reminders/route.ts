import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";
import { NextResponse } from "next/server";

function currentTimeHHmm() {
  const now = new Date();
  return `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const day = now.getUTCDay();
  const time = currentTimeHHmm();

  const habits = await prisma.habit.findMany({
    where: {
      isActive: true,
      reminderEnabled: true,
      reminderTime: time,
    },
    include: {
      user: { include: { pushSubscriptions: true } },
    },
  });

  for (const habit of habits) {
    for (const sub of habit.user.pushSubscriptions) {
      try {
        await sendPushNotification(sub, {
          title: "Напоминание о привычке",
          body: habit.title,
          url: "/today",
        });
      } catch (e) {
        console.error("Push failed", e);
      }
    }
  }

  const tasks = await prisma.task.findMany({
    where: {
      reminderEnabled: true,
      reminderTime: time,
      status: "PENDING",
    },
    include: {
      goal: {
        include: {
          user: { include: { pushSubscriptions: true } },
        },
      },
    },
  });

  for (const task of tasks) {
    for (const sub of task.goal.user.pushSubscriptions) {
      try {
        await sendPushNotification(sub, {
          title: "Напоминание о задаче",
          body: task.title,
          url: "/today",
        });
      } catch (e) {
        console.error("Push failed", e);
      }
    }
  }

  const wheelUsers = await prisma.notificationPreference.findMany({
    where: {
      wheelReviewEnabled: true,
      wheelReviewDay: day,
      wheelReviewTime: time,
    },
    include: {
      user: { include: { pushSubscriptions: true } },
    },
  });

  for (const pref of wheelUsers) {
    for (const sub of pref.user.pushSubscriptions) {
      try {
        await sendPushNotification(sub, {
          title: "Пересмотрите колесо баланса",
          body: "Уделите 5 минут оценке сфер жизни",
          url: "/spheres",
        });
      } catch (e) {
        console.error("Push failed", e);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    habits: habits.length,
    tasks: tasks.length,
    wheel: wheelUsers.length,
  });
}
