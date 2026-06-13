"use server";

import { prisma } from "@/lib/prisma";
import { revalidateUserData } from "@/lib/cache-tags";
import { requireUser } from "@/lib/session";
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

export async function createTask(data: {
  goalId: string;
  planStepId?: string;
  title: string;
  dueDate?: string;
  recurrenceJson?: string;
}) {
  const user = await requireUser();
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
    },
  });

  revalidateUserData(user.id);
  return task;
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
