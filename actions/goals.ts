"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidateUserData } from "@/lib/cache-tags";
import { requireUser } from "@/lib/session";
import { ensureUserTimezone } from "@/actions/settings";
import { getNextOccurrence, parseRecurrenceJson } from "@/lib/recurrence";

export async function createGoal(data: {
  sphereId: string;
  title: string;
  description?: string;
  deadline?: string;
  targetScore?: number;
}) {
  const user = await requireUser();

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      sphereId: data.sphereId,
      title: data.title,
      description: data.description,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      targetScore: data.targetScore,
    },
  });

  revalidateUserData(user.id);
  return goal;
}

export async function updateGoalStatus(
  goalId: string,
  status: "ACTIVE" | "COMPLETED" | "PAUSED"
) {
  const user = await requireUser();

  await prisma.goal.updateMany({
    where: { id: goalId, userId: user.id },
    data: { status },
  });

  revalidateUserData(user.id);
}

export async function updateGoal(
  goalId: string,
  data: {
    title: string;
    description?: string;
    deadline?: string;
    status?: "ACTIVE" | "COMPLETED" | "PAUSED";
  }
) {
  const user = await requireUser();

  const result = await prisma.goal.updateMany({
    where: { id: goalId, userId: user.id },
    data: {
      title: data.title,
      description: data.description ?? null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      ...(data.status ? { status: data.status } : {}),
    },
  });

  if (result.count === 0) throw new Error("Goal not found");

  revalidateUserData(user.id);
}

export async function deleteGoal(goalId: string) {
  const user = await requireUser();

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
    select: { id: true },
  });
  if (!goal) throw new Error("Goal not found");

  await prisma.$transaction(async (tx) => {
    const habits = await tx.habit.findMany({
      where: { goalId },
      select: { id: true },
    });
    const habitIds = habits.map((h) => h.id);

    if (habitIds.length > 0) {
      await tx.habitLog.deleteMany({ where: { habitId: { in: habitIds } } });
      await tx.habit.deleteMany({ where: { id: { in: habitIds } } });
    }

    await tx.goal.delete({ where: { id: goalId } });
  });

  revalidateUserData(user.id);
}

export async function createPlanStep(goalId: string, title: string) {
  const user = await requireUser();
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });
  if (!goal) throw new Error("Goal not found");

  const maxOrder = await prisma.planStep.aggregate({
    where: { goalId },
    _max: { order: true },
  });

  const step = await prisma.planStep.create({
    data: {
      goalId,
      title,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidateUserData(user.id);
  return step;
}

export async function updatePlanStep(stepId: string, data: { title: string }) {
  const user = await requireUser();

  const step = await prisma.planStep.findFirst({
    where: { id: stepId, goal: { userId: user.id } },
  });
  if (!step) throw new Error("Plan step not found");

  await prisma.planStep.update({
    where: { id: stepId },
    data: { title: data.title },
  });

  revalidateUserData(user.id);
}

export async function deletePlanStep(stepId: string) {
  const user = await requireUser();

  const step = await prisma.planStep.findFirst({
    where: { id: stepId, goal: { userId: user.id } },
    select: { id: true },
  });
  if (!step) throw new Error("Plan step not found");

  await prisma.$transaction([
    prisma.task.deleteMany({ where: { planStepId: stepId } }),
    prisma.planStep.delete({ where: { id: stepId } }),
  ]);

  revalidateUserData(user.id);
}

export async function createTask(data: {
  goalId: string;
  planStepId?: string;
  title: string;
  dueDate?: string;
  recurrenceJson?: string;
  reminderTime?: string;
  reminderEnabled?: boolean;
  timezone?: string;
}) {
  const user = await requireUser();
  if (data.timezone) await ensureUserTimezone(data.timezone);
  const goal = await prisma.goal.findFirst({
    where: { id: data.goalId, userId: user.id },
  });
  if (!goal) throw new Error("Goal not found");

  const rule = parseRecurrenceJson(
    data.recurrenceJson ? JSON.parse(data.recurrenceJson) : null
  );

  const task = await prisma.task.create({
    data: {
      goalId: data.goalId,
      planStepId: data.planStepId,
      title: data.title,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      recurrence: rule.preset !== "none" ? (rule as object) : undefined,
      reminderTime: data.reminderEnabled ? data.reminderTime : undefined,
      reminderEnabled: data.reminderEnabled ?? false,
    },
  });

  revalidateUserData(user.id);
  return task;
}

export async function updateTaskSettings(
  taskId: string,
  data: {
    title?: string;
    dueDate?: string;
    recurrenceJson?: string;
    reminderTime?: string | null;
    reminderEnabled?: boolean;
    timezone?: string;
  }
) {
  const user = await requireUser();
  if (data.timezone) await ensureUserTimezone(data.timezone);
  const task = await prisma.task.findFirst({
    where: { id: taskId, goal: { userId: user.id } },
  });
  if (!task) throw new Error("Task not found");

  const rule = parseRecurrenceJson(
    data.recurrenceJson ? JSON.parse(data.recurrenceJson) : null
  );

  await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      dueDate: data.dueDate ? new Date(data.dueDate) : task.dueDate,
      recurrence:
        rule.preset !== "none" ? (rule as object) : Prisma.DbNull,
      reminderEnabled: data.reminderEnabled ?? false,
      reminderTime:
        data.reminderEnabled && data.reminderTime ? data.reminderTime : null,
    },
  });

  revalidateUserData(user.id);
}

export async function deleteTask(taskId: string) {
  const user = await requireUser();

  const task = await prisma.task.findFirst({
    where: { id: taskId, goal: { userId: user.id } },
    select: { id: true },
  });
  if (!task) throw new Error("Task not found");

  await prisma.task.delete({ where: { id: taskId } });

  revalidateUserData(user.id);
}

export async function toggleTask(taskId: string, completed: boolean) {
  const user = await requireUser();
  const task = await prisma.task.findFirst({
    where: { id: taskId, goal: { userId: user.id } },
  });
  if (!task) throw new Error("Task not found");

  const rule = parseRecurrenceJson(task.recurrence);

  if (completed && rule.preset !== "none") {
    const next = getNextOccurrence(rule, task.dueDate ?? new Date());
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "PENDING",
        dueDate: next ?? task.dueDate,
      },
    });
  } else {
    await prisma.task.update({
      where: { id: taskId },
      data: { status: completed ? "COMPLETED" : "PENDING" },
    });
  }

  revalidateUserData(user.id);
}
