import { prisma } from "@/lib/prisma";
import { ensureUserSpheres } from "@/lib/spheres";
import { getSessionUser } from "@/lib/session";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const user = await getSessionUser();

  await ensureUserSpheres(user.id);

  const spheres = await prisma.sphere.findMany({
    where: { userId: user.id },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, color: true },
  });

  return <OnboardingForm spheres={spheres} />;
}
