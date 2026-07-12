import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS, userTag } from "@/lib/cache-tags";
import { getLatestSphereScores } from "@/lib/spheres";

const CACHE_SECONDS = 30;

function cacheOpts(userId: string, key: string) {
  return {
    revalidate: CACHE_SECONDS,
    tags: [userTag(userId), key],
  };
}

async function fetchWheelData(userId: string) {
  const sphereScores = await getLatestSphereScores(userId);
  return { sphereScores };
}

export function getCachedWheelData(userId: string) {
  return unstable_cache(
    () => fetchWheelData(userId),
    ["wheel", userId],
    cacheOpts(userId, CACHE_TAGS.wheel)
  )();
}

async function fetchSphereDetailData(userId: string, sphereId: string) {
  const [sphere, journal, blocks] = await Promise.all([
    prisma.sphere.findFirst({
      where: { id: sphereId, userId },
      select: { id: true, name: true, color: true, isPriority: true },
    }),
    prisma.sphereScore.findMany({
      where: {
        sphereId,
        assessment: { userId },
      },
      orderBy: { assessment: { createdAt: "desc" } },
      take: 50,
      select: {
        id: true,
        score: true,
        description: true,
        assessment: { select: { createdAt: true } },
      },
    }),
    prisma.goal.findMany({
      where: { sphereId, userId, status: { not: "PAUSED" } },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        deadline: true,
        tasks: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            title: true,
            notes: true,
            status: true,
          },
        },
      },
    }),
  ]);

  if (!sphere) return null;

  return { sphere, journal, blocks };
}

export function getCachedSphereDetailData(userId: string, sphereId: string) {
  return unstable_cache(
    () => fetchSphereDetailData(userId, sphereId),
    ["sphere-detail", userId, sphereId],
    cacheOpts(userId, CACHE_TAGS.spheres)
  )();
}

async function fetchSettingsData(userId: string) {
  const spheres = await prisma.sphere.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, defaultName: true, color: true },
  });

  return { spheres };
}

export function getCachedSettingsData(userId: string) {
  return unstable_cache(
    () => fetchSettingsData(userId),
    ["settings", userId],
    cacheOpts(userId, CACHE_TAGS.settings)
  )();
}

async function fetchSpheresPageData(userId: string) {
  return getLatestSphereScores(userId);
}

export function getCachedSpheresPageData(userId: string) {
  return unstable_cache(
    () => fetchSpheresPageData(userId),
    ["spheres-page", userId],
    cacheOpts(userId, CACHE_TAGS.spheres)
  )();
}
