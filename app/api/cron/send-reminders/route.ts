import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";
import { DEFAULT_TIMEZONE, getLocalDay, getLocalHHmm } from "@/lib/timezone";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let habitsSent = 0;
  let tasksSent = 0;
  let wheelSent = 0;

  const habits = await prisma.habit.findMany({
    where: {
      isActive: true,
      reminderEnabled: true,
      reminderTime: { not: null },
    },
    include: {
      user: {
        include: {
          pushSubscriptions: true,
          notificationPreference: true,
        },
      },
    },
  });

  for (const habit of habits) {
    if (habit.user.pushSubscriptions.length === 0) continue;

    const tz = habit.user.notificationPreference?.timezone ?? DEFAULT_TIMEZONE;
    if (getLocalHHmm(now, tz) !== habit.reminderTime) continue;

    for (const sub of habit.user.pushSubscriptions) {
      try {
        await sendPushNotification(sub, {
          title: "Напоминание о привычке",
          body: habit.title,
          url: "/today",
        });
        habitsSent++;
      } catch (e) {
        console.error("Push failed", e);
      }
    }
  }

  const tasks = await prisma.task.findMany({
    where: {
      reminderEnabled: true,
      reminderTime: { not: null },
      status: "PENDING",
    },
    include: {
      goal: {
        include: {
          user: {
            include: {
              pushSubscriptions: true,
              notificationPreference: true,
            },
          },
        },
      },
    },
  });

  for (const task of tasks) {
    const user = task.goal.user;
    if (user.pushSubscriptions.length === 0) continue;

    const tz = user.notificationPreference?.timezone ?? DEFAULT_TIMEZONE;
    if (getLocalHHmm(now, tz) !== task.reminderTime) continue;

    for (const sub of user.pushSubscriptions) {
      try {
        await sendPushNotification(sub, {
          title: "Напоминание о задаче",
          body: task.title,
          url: "/today",
        });
        tasksSent++;
      } catch (e) {
        console.error("Push failed", e);
      }
    }
  }

  const wheelUsers = await prisma.notificationPreference.findMany({
    where: { wheelReviewEnabled: true },
    include: {
      user: { include: { pushSubscriptions: true } },
    },
  });

  for (const pref of wheelUsers) {
    if (pref.user.pushSubscriptions.length === 0) continue;

    const tz = pref.timezone ?? DEFAULT_TIMEZONE;
    if (getLocalDay(now, tz) !== pref.wheelReviewDay) continue;
    if (getLocalHHmm(now, tz) !== pref.wheelReviewTime) continue;

    for (const sub of pref.user.pushSubscriptions) {
      try {
        await sendPushNotification(sub, {
          title: "Пересмотрите колесо баланса",
          body: "Уделите 5 минут оценке сфер жизни",
          url: "/spheres",
        });
        wheelSent++;
      } catch (e) {
        console.error("Push failed", e);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    habits: habitsSent,
    tasks: tasksSent,
    wheel: wheelSent,
  });
}
