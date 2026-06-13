"use server";

import { prisma } from "@/lib/prisma";
import { unstable_update } from "@/lib/auth";
import { revalidateUserData } from "@/lib/cache-tags";
import { requireUser } from "@/lib/session";

export async function updateNotificationPreferences(data: {
  habitsEnabled?: boolean;
  wheelReviewEnabled?: boolean;
  wheelReviewDay?: number;
  wheelReviewTime?: string;
  timezone?: string;
}) {
  const user = await requireUser();

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  });

  revalidateUserData(user.id);
}

export async function ensureUserTimezone(timezone: string) {
  const user = await requireUser();
  if (!timezone) return;

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id, timezone },
    update: { timezone },
  });
}

/** Удаляет все цели, привычки, оценки и возвращает к онбордингу */
export async function resetLifeBalance() {
  const user = await requireUser();

  await prisma.$transaction(async (tx) => {
    await tx.habitLog.deleteMany({
      where: { habit: { userId: user.id } },
    });
    await tx.habit.deleteMany({ where: { userId: user.id } });
    await tx.task.deleteMany({ where: { goal: { userId: user.id } } });
    await tx.planStep.deleteMany({ where: { goal: { userId: user.id } } });
    await tx.aiPlanDraft.deleteMany({ where: { goal: { userId: user.id } } });
    await tx.goal.deleteMany({ where: { userId: user.id } });
    await tx.assessment.deleteMany({ where: { userId: user.id } });

    const spheres = await tx.sphere.findMany({
      where: { userId: user.id },
      select: { id: true, defaultName: true },
    });

    await Promise.all(
      spheres.map((sphere) =>
        tx.sphere.update({
          where: { id: sphere.id },
          data: { isPriority: false, name: sphere.defaultName },
        })
      )
    );

    await tx.user.update({
      where: { id: user.id },
      data: { onboarded: false },
    });
  });

  await unstable_update({ user: { onboarded: false } });
  revalidateUserData(user.id);
}
