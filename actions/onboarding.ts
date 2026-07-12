"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { unstable_update } from "@/lib/auth";
import { revalidateUserData } from "@/lib/cache-tags";
import { requireUser } from "@/lib/session";
import { ensureUserSpheres } from "@/lib/spheres";

export async function completeOnboarding(
  scores: { sphereId: string; score: number }[],
  prioritySphereIds: string[]
) {
  const user = await requireUser();
  await ensureUserSpheres(user.id);

  await prisma.$transaction(async (tx) => {
    await tx.assessment.create({
      data: {
        userId: user.id,
        scores: {
          create: scores.map((s) => ({
            sphereId: s.sphereId,
            score: s.score,
          })),
        },
      },
    });

    await tx.sphere.updateMany({
      where: { userId: user.id },
      data: { isPriority: false },
    });

    if (prioritySphereIds.length > 0) {
      await tx.sphere.updateMany({
        where: { id: { in: prioritySphereIds }, userId: user.id },
        data: { isPriority: true },
      });
    }

    await tx.user.update({
      where: { id: user.id },
      data: { onboarded: true },
    });
  });

  await unstable_update({ user: { onboarded: true } });
  revalidateUserData(user.id);
  redirect("/wheel");
}
