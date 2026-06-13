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
        tasks: s.tasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          dueDate: t.dueDate?.toISOString() ?? null,
        })),
      }))}
      looseTasks={goal.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        dueDate: t.dueDate?.toISOString() ?? null,
      }))}
      habits={goal.habits.map((h) => ({
        id: h.id,
        title: h.title,
        reminderTime: h.reminderTime,
      }))}
    />
  );
}
