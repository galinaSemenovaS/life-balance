import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Один вызов auth() на весь request (layout + page) */
export const getSession = cache(async () => auth());

export const getSessionUser = cache(async () => {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
});

export async function requireUser() {
  return getSessionUser();
}
