"use server";

import { prisma } from "@/lib/prisma";
import { revalidateUserData } from "@/lib/cache-tags";
import { requireUser } from "@/lib/session";

export async function renameSphere(sphereId: string, name: string) {
  const user = await requireUser();

  await prisma.sphere.updateMany({
    where: { id: sphereId, userId: user.id },
    data: { name },
  });

  revalidateUserData(user.id);
}

export async function setSpherePriority(sphereId: string, isPriority: boolean) {
  const user = await requireUser();

  if (isPriority) {
    const count = await prisma.sphere.count({
      where: { userId: user.id, isPriority: true },
    });
    if (count >= 2) {
      throw new Error("Можно выбрать не более 2 приоритетных сфер");
    }
  }

  await prisma.sphere.updateMany({
    where: { id: sphereId, userId: user.id },
    data: { isPriority },
  });

  revalidateUserData(user.id);
}

export async function updateSingleSphereScore(
  sphereId: string,
  score: number,
  description?: string
) {
  const user = await requireUser();

  const sphere = await prisma.sphere.findFirst({
    where: { id: sphereId, userId: user.id },
    select: { id: true },
  });
  if (!sphere) throw new Error("Sphere not found");

  const assessment = await prisma.assessment.create({
    data: {
      userId: user.id,
      scores: {
        create: {
          sphereId,
          score,
          description: description || null,
        },
      },
    },
  });

  revalidateUserData(user.id);
  return assessment;
}

export async function updateSphereScores(
  scores: Array<{ sphereId: string; score: number }>
) {
  const user = await requireUser();

  await prisma.assessment.create({
    data: {
      userId: user.id,
      scores: {
        create: scores.map(({ sphereId, score }) => ({ sphereId, score })),
      },
    },
  });

  revalidateUserData(user.id);
}
