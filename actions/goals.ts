"use server";

import { prisma } from "@/lib/prisma";
import { revalidateUserData } from "@/lib/cache-tags";
import { requireUser } from "@/lib/session";

export async function createGoal(data: {
  sphereId: string;
  title: string;
  description?: string;
  deadline?: string;
}) {
  const user = await requireUser();

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      sphereId: data.sphereId,
      title: data.title,
      description: data.description,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    },
  });

  revalidateUserData(user.id);
  return goal;
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

export async function deleteGoal(goalId: string) {
  const user = await requireUser();

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
    select: { id: true },
  });
  if (!goal) throw new Error("Goal not found");

  await prisma.goal.delete({ where: { id: goalId } });

  revalidateUserData(user.id);
}

export async function createTask(data: {
  goalId: string;
  title: string;
  notes?: string;
}) {
  const user = await requireUser();

  const goal = await prisma.goal.findFirst({
    where: { id: data.goalId, userId: user.id },
  });
  if (!goal) throw new Error("Goal not found");

  const task = await prisma.task.create({
    data: {
      goalId: data.goalId,
      title: data.title,
      notes: data.notes,
    },
  });

  revalidateUserData(user.id);
  return task;
}

export async function updateTask(
  taskId: string,
  data: { title: string; notes?: string }
) {
  const user = await requireUser();

  const task = await prisma.task.findFirst({
    where: { id: taskId, goal: { userId: user.id } },
  });
  if (!task) throw new Error("Task not found");

  await prisma.task.update({
    where: { id: taskId },
    data: {
      title: data.title,
      notes: data.notes ?? null,
    },
  });

  revalidateUserData(user.id);
}

export async function toggleTaskStatus(taskId: string, completed: boolean) {
  const user = await requireUser();

  const task = await prisma.task.findFirst({
    where: { id: taskId, goal: { userId: user.id } },
  });
  if (!task) throw new Error("Task not found");

  await prisma.task.update({
    where: { id: taskId },
    data: { status: completed ? "COMPLETED" : "PENDING" },
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
