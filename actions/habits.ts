"use server";

import { startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { revalidateUserData } from "@/lib/cache-tags";
import { requireUser } from "@/lib/session";
import {
  getNextOccurrence,
  parseRecurrenceJson,
  recurrenceToFrequency,
  type RecurrenceRule,
} from "@/lib/recurrence";

function endDateFromRule(rule: RecurrenceRule): Date | undefined {
  if (rule.endType === "onDate" && rule.endDate) {
    return startOfDay(new Date(rule.endDate));
  }
  return undefined;
}

export async function createHabit(data: {
  title: string;
  goalId: string;
  reminderTime?: string;
  reminderEnabled?: boolean;
  recurrenceJson?: string;
}) {
  const user = await requireUser();
  const rule = parseRecurrenceJson(
    data.recurrenceJson ? JSON.parse(data.recurrenceJson) : null
  );

  const goal = await prisma.goal.findFirst({
    where: { id: data.goalId, userId: user.id },
    select: { id: true, sphereId: true },
  });
  if (!goal) throw new Error("Цель не найдена");

  const habit = await prisma.habit.create({
    data: {
      userId: user.id,
      title: data.title,
      sphereId: goal.sphereId,
      goalId: goal.id,
      reminderEnabled: data.reminderEnabled ?? false,
      reminderTime:
        data.reminderEnabled && data.reminderTime ? data.reminderTime : undefined,
      frequency: recurrenceToFrequency(rule),
      schedule: rule as object,
      endDate: endDateFromRule(rule),
    },
  });

  revalidateUserData(user.id);
  return habit;
}

export async function toggleHabitLog(
  habitId: string,
  completed: boolean,
  date?: string
) {
  const user = await requireUser();
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: user.id },
  });
  if (!habit) throw new Error("Habit not found");

  const logDate = startOfDay(date ? new Date(date) : new Date());

  if (completed) {
    await prisma.habitLog.upsert({
      where: {
        habitId_date: { habitId, date: logDate },
      },
      create: { habitId, date: logDate, completed: true },
      update: { completed: true },
    });
  } else {
    await prisma.habitLog.deleteMany({
      where: { habitId, date: logDate },
    });
  }

  revalidateUserData(user.id);
}

export async function updateHabitSettings(
  habitId: string,
  data: {
    reminderTime?: string | null;
    reminderEnabled?: boolean;
    recurrenceJson?: string;
  }
) {
  const user = await requireUser();

  const rule = data.recurrenceJson
    ? parseRecurrenceJson(JSON.parse(data.recurrenceJson))
    : null;

  await prisma.habit.updateMany({
    where: { id: habitId, userId: user.id },
    data: {
      ...(rule
        ? {
            frequency: recurrenceToFrequency(rule),
            schedule: rule as object,
            endDate: endDateFromRule(rule),
          }
        : {}),
      reminderEnabled: data.reminderEnabled ?? false,
      reminderTime:
        data.reminderEnabled && data.reminderTime ? data.reminderTime : null,
    },
  });

  revalidateUserData(user.id);
}

/** @deprecated используйте updateHabitSettings */
export async function updateHabitReminder(
  habitId: string,
  reminderTime: string | null
) {
  await updateHabitSettings(habitId, {
    reminderTime,
    reminderEnabled: Boolean(reminderTime),
  });
}
