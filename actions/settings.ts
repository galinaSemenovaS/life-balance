"use server";

import { prisma } from "@/lib/prisma";
import { unstable_update } from "@/lib/auth";
import { revalidateUserData } from "@/lib/cache-tags";
import { requireUser } from "@/lib/session";

export async function resetLifeBalance() {
  const user = await requireUser();

  await prisma.$transaction(async (tx) => {
    await tx.task.deleteMany({ where: { goal: { userId: user.id } } });
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
