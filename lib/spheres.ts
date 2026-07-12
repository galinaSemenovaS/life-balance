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
  const spheres = await prisma.sphere.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      color: true,
      isPriority: true,
      scores: {
        orderBy: { assessment: { createdAt: "desc" } },
        take: 1,
        select: {
          score: true,
          description: true,
          assessment: { select: { createdAt: true } },
        },
      },
    },
  });

  return spheres.map((s) => ({
    sphereId: s.id,
    name: s.name,
    color: s.color,
    isPriority: s.isPriority,
    score: s.scores[0]?.score ?? null,
    description: s.scores[0]?.description ?? null,
    lastAssessedAt: s.scores[0]?.assessment.createdAt ?? null,
  }));
}
