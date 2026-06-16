import { unstable_cache } from "next/cache";
import { startOfDay, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS, userTag } from "@/lib/cache-tags";
import { getGoalProgress } from "@/lib/progress";

const CACHE_SECONDS = 30;

function cacheOpts(userId: string, key: string) {
  return {
    revalidate: CACHE_SECONDS,
    tags: [userTag(userId), key],
  };
}

async function fetchLatestSphereScores(userId: string) {
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

export function getCachedSphereScores(userId: string) {
  return unstable_cache(
    () => fetchLatestSphereScores(userId),
    ["sphere-scores", userId],
    cacheOpts(userId, CACHE_TAGS.scores)
  )();
}

async function fetchSpheresPageData(userId: string) {
  const [spheres, scores] = await Promise.all([
    prisma.sphere.findMany({
      where: { userId },
      orderBy: [{ isPriority: "desc" }, { sortOrder: "asc" }],
      select: {
        id: true,
        name: true,
        color: true,
        isPriority: true,
        goals: {
          where: { status: "ACTIVE" },
          select: {
            tasks: { select: { status: true } },
          },
        },
      },
    }),
    fetchLatestSphereScores(userId),
  ]);

  const scoreMap = Object.fromEntries(scores.map((s) => [s.sphereId, s.score]));

  return {
    spheres: spheres.map((sphere) => {
      const allTasks = sphere.goals.flatMap((g) => g.tasks);
      return {
        id: sphere.id,
        name: sphere.name,
        color: sphere.color,
        isPriority: sphere.isPriority,
        goalCount: sphere.goals.length,
        progress: getGoalProgress(allTasks),
        score: scoreMap[sphere.id],
      };
    }),
    reassessSpheres: spheres.map((s) => ({
      id: s.id,
      name: s.name,
      score: scoreMap[s.id] ?? 5,
    })),
  };
}

export function getCachedSpheresPageData(userId: string) {
  return unstable_cache(
    () => fetchSpheresPageData(userId),
    ["spheres-page", userId],
    cacheOpts(userId, CACHE_TAGS.spheres)
  )();
}

async function fetchTodayData(userId: string, forDate: Date) {
  const day = startOfDay(forDate);

  const [habits, tasks] = await Promise.all([
    prisma.habit.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        title: true,
        frequency: true,
        schedule: true,
        endDate: true,
        isActive: true,
        createdAt: true,
        sphere: { select: { name: true, color: true } },
        goal: { select: { title: true } },
        logs: {
          where: { date: day },
          select: { completed: true, date: true },
        },
      },
    }),
    prisma.task.findMany({
      where: {
        goal: { userId, status: "ACTIVE" },
      },
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        recurrence: true,
        createdAt: true,
        goal: { select: { title: true } },
        logs: {
          where: { date: day },
          select: { completed: true, date: true },
        },
      },
    }),
  ]);

  return { habits, tasks };
}

export function getCachedTodayData(userId: string, dateKey: string) {
  return unstable_cache(
    () => fetchTodayData(userId, startOfDay(new Date(dateKey))),
    ["today", userId, dateKey],
    cacheOpts(userId, CACHE_TAGS.today)
  )();
}

async function fetchDashboardData(userId: string) {
  const today = startOfDay(new Date());
  const monthAgo = subDays(today, 30);

  const [scores, goals, habits, todayTasks] = await Promise.all([
    fetchLatestSphereScores(userId),
    prisma.goal.findMany({
      where: { userId, status: "ACTIVE" },
      select: {
        id: true,
        title: true,
        sphere: { select: { name: true } },
        tasks: { select: { status: true } },
      },
      take: 5,
    }),
    prisma.habit.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        title: true,
        frequency: true,
        schedule: true,
        endDate: true,
        isActive: true,
        createdAt: true,
        logs: {
          where: { date: { gte: monthAgo } },
          select: { date: true, completed: true },
        },
      },
      take: 4,
    }),
    prisma.task.findMany({
      where: {
        goal: { userId, status: "ACTIVE" },
      },
      select: {
        id: true,
        status: true,
        dueDate: true,
        recurrence: true,
        createdAt: true,
        logs: {
          where: { date: today },
          select: { date: true, completed: true },
        },
      },
    }),
  ]);

  return { scores, goals, habits, todayTasks };
}

export function getCachedDashboardData(userId: string) {
  return unstable_cache(
    () => fetchDashboardData(userId),
    ["dashboard", userId],
    cacheOpts(userId, CACHE_TAGS.dashboard)
  )();
}

async function fetchAnalyticsData(userId: string) {
  const today = startOfDay(new Date());
  const weekAgo = subDays(today, 6);

  const [assessments, habits] = await Promise.all([
    prisma.assessment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        createdAt: true,
        scores: {
          select: {
            score: true,
            sphere: { select: { name: true } },
          },
        },
      },
    }),
    prisma.habit.findMany({
      where: { userId, isActive: true },
      select: {
        title: true,
        logs: {
          where: { date: { gte: weekAgo } },
          select: { date: true, completed: true },
        },
      },
    }),
  ]);

  return { assessments: assessments.reverse(), habits };
}

export function getCachedAnalyticsData(userId: string) {
  return unstable_cache(
    () => fetchAnalyticsData(userId),
    ["analytics", userId],
    cacheOpts(userId, CACHE_TAGS.analytics)
  )();
}

async function fetchSettingsData(userId: string) {
  const [prefs, spheres] = await Promise.all([
    prisma.notificationPreference.findUnique({
      where: { userId },
    }),
    prisma.sphere.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return { prefs, spheres };
}

export function getCachedSettingsData(userId: string) {
  return unstable_cache(
    () => fetchSettingsData(userId),
    ["settings", userId],
    cacheOpts(userId, CACHE_TAGS.settings)
  )();
}
