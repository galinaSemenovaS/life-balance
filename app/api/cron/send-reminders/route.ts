import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";
import { isHabitDueOnDate, isTaskDueOnDate } from "@/lib/progress";
import {
  DEFAULT_TIMEZONE,
  isReminderInWindow,
  isWheelReviewDue,
  wasReminderSentRecently,
} from "@/lib/reminders";
import { NextResponse } from "next/server";
import { startOfDay } from "date-fns";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const today = startOfDay(now);
  let habitsSent = 0;
  let tasksSent = 0;
  let wheelSent = 0;

  const habits = await prisma.habit.findMany({
    where: {
      isActive: true,
      reminderEnabled: true,
      reminderTime: { not: null },
    },
    select: {
      id: true,
      title: true,
      frequency: true,
      schedule: true,
      endDate: true,
      createdAt: true,
      reminderTime: true,
      lastReminderAt: true,
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
    if (!habit.reminderTime) continue;
    if (!isReminderInWindow(habit.reminderTime, now, tz)) continue;
    if (wasReminderSentRecently(habit.lastReminderAt, now)) continue;
    if (!isHabitDueOnDate(habit, today)) continue;

    let sent = false;
    for (const sub of habit.user.pushSubscriptions) {
      try {
        await sendPushNotification(sub, {
          title: "Напоминание о привычке",
          body: habit.title,
          url: "/today",
        });
        sent = true;
        habitsSent++;
      } catch (e) {
        console.error("Push failed", e);
      }
    }

    if (sent) {
      await prisma.habit.update({
        where: { id: habit.id },
        data: { lastReminderAt: now },
      });
    }
  }

  const tasks = await prisma.task.findMany({
    where: {
      reminderEnabled: true,
      reminderTime: { not: null },
      status: "PENDING",
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      recurrence: true,
      createdAt: true,
      reminderTime: true,
      lastReminderAt: true,
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
    if (!task.reminderTime) continue;
    if (!isReminderInWindow(task.reminderTime, now, tz)) continue;
    if (wasReminderSentRecently(task.lastReminderAt, now)) continue;
    if (!isTaskDueOnDate(task, today)) continue;

    let sent = false;
    for (const sub of user.pushSubscriptions) {
      try {
        await sendPushNotification(sub, {
          title: "Напоминание о задаче",
          body: task.title,
          url: "/today",
        });
        sent = true;
        tasksSent++;
      } catch (e) {
        console.error("Push failed", e);
      }
    }

    if (sent) {
      await prisma.task.update({
        where: { id: task.id },
        data: { lastReminderAt: now },
      });
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
    if (!isWheelReviewDue(pref, now, tz)) continue;

    let sent = false;
    for (const sub of pref.user.pushSubscriptions) {
      try {
        await sendPushNotification(sub, {
          title: "Пересмотрите колесо баланса",
          body: "Уделите 5 минут оценке сфер жизни",
          url: "/spheres",
        });
        sent = true;
        wheelSent++;
      } catch (e) {
        console.error("Push failed", e);
      }
    }

    if (sent) {
      await prisma.notificationPreference.update({
        where: { id: pref.id },
        data: { lastWheelReminderAt: now },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    habits: habitsSent,
    tasks: tasksSent,
    wheel: wheelSent,
  });
}
