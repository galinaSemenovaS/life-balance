import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";

export default async function GoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const goal = await prisma.goal.findFirst({
    where: { id, userId: user.id },
    select: { sphereId: true },
  });

  if (!goal) notFound();

  redirect(`/spheres/${goal.sphereId}`);
}
