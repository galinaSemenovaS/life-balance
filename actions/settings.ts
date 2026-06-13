"use server";

import { prisma } from "@/lib/prisma";
import { revalidateUserData } from "@/lib/cache-tags";
import { requireUser } from "@/lib/session";

export async function updateNotificationPreferences(data: {
  habitsEnabled?: boolean;
  wheelReviewEnabled?: boolean;
  wheelReviewDay?: number;
  wheelReviewTime?: string;
}) {
  const user = await requireUser();

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  });

  revalidateUserData(user.id);
}
