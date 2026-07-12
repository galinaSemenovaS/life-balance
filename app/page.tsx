import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!session.user.onboarded) {
    redirect("/onboarding");
  }

  redirect("/wheel");
}
