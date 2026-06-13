import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const endpoint = body.endpoint as string;
  const keys = body.keys as { p256dh: string; auth: string };
  const timezone =
    typeof body.timezone === "string" && body.timezone.length > 0
      ? body.timezone
      : DEFAULT_TIMEZONE;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      update: {
        userId: session.user.id,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    }),
    prisma.notificationPreference.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, timezone },
      update: { timezone },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
