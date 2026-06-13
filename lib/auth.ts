import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { resolveSiteUrl } from "@/lib/site-url";

// NextAuth читает AUTH_URL напрямую — синхронизируем с resolveSiteUrl
process.env.AUTH_URL = resolveSiteUrl();

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
});
