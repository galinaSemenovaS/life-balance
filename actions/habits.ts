"use server";

import { startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { revalidateUserData } from "@/lib/cache-tags";
import { requireUser } from "@/lib/session";

export async function createHabit(data: {
  title: string;
  sphereId?: string;
  goalId?: string;
  reminderTime?: string;
  frequency?: "DAILY" | "WEEKLY";
}) {
  const user = await requireUser();

  const habit = await prisma.habit.create({
    data: {
      userId: user.id,
      title: data.title,
      sphereId: data.sphereId,
      goalId: data.goalId,
      reminderTime: data.reminderTime,
      frequency: data.frequency ?? "DAILY",
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

export async function updateHabitReminder(
  habitId: string,
  reminderTime: string | null
) {
  const user = await requireUser();

  await prisma.habit.updateMany({
    where: { id: habitId, userId: user.id },
    data: { reminderTime },
  });

  revalidateUserData(user.id);
}
