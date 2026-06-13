import { prisma } from "@/lib/prisma";
import { GoalDetail } from "@/components/goals/GoalDetail";
import { getSessionUser } from "@/lib/session";
import { notFound } from "next/navigation";

export default async function GoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();

  const goal = await prisma.goal.findFirst({
    where: { id, userId: user.id },
    include: {
      sphere: true,
      planSteps: {
        orderBy: { order: "asc" },
        include: { tasks: { orderBy: { createdAt: "asc" } } },
      },
      tasks: { where: { planStepId: null }, orderBy: { createdAt: "asc" } },
      habits: { where: { isActive: true } },
    },
  });

  if (!goal) notFound();

  const mapTask = (t: (typeof goal.tasks)[0]) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    dueDate: t.dueDate?.toISOString() ?? null,
    recurrence: t.recurrence,
    reminderTime: t.reminderTime,
    reminderEnabled: t.reminderEnabled,
  });

  return (
    <GoalDetail
      goal={{
        id: goal.id,
        title: goal.title,
        description: goal.description,
        status: goal.status,
        sphere: { name: goal.sphere.name, color: goal.sphere.color },
      }}
      sphereId={goal.sphereId}
      steps={goal.planSteps.map((s) => ({
        id: s.id,
        title: s.title,
        order: s.order,
        tasks: s.tasks.map(mapTask),
      }))}
      looseTasks={goal.tasks.map(mapTask)}
      habits={goal.habits.map((h) => ({
        id: h.id,
        title: h.title,
        reminderTime: h.reminderTime,
        reminderEnabled: h.reminderEnabled,
        schedule: h.schedule,
        endDate: h.endDate?.toISOString() ?? null,
      }))}
    />
  );
}
