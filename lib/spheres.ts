import { prisma } from "@/lib/prisma";
import { DEFAULT_SPHERES } from "@/lib/constants";

export async function ensureUserSpheres(userId: string) {
  const existing = await prisma.sphere.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (existing) return;

  await prisma.sphere.createMany({
    data: DEFAULT_SPHERES.map((s) => ({
      userId,
      name: s.defaultName,
      defaultName: s.defaultName,
      color: s.color,
      sortOrder: s.sortOrder,
    })),
  });
}

export async function getLatestSphereScores(userId: string) {
  const assessment = await prisma.assessment.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      scores: {
        select: {
          score: true,
          sphereId: true,
          sphere: { select: { name: true, color: true, isPriority: true } },
        },
      },
    },
  });

  if (!assessment) return [];

  return assessment.scores.map((s) => ({
    sphereId: s.sphereId,
    name: s.sphere.name,
    color: s.sphere.color,
    score: s.score,
    isPriority: s.sphere.isPriority,
  }));
}
