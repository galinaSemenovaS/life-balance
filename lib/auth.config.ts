import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.onboarded =
          (user as { onboarded?: boolean }).onboarded ?? false;
      } else if (token.onboarded === undefined) {
        token.onboarded = false;
      }
      if (trigger === "update" && session?.user?.onboarded !== undefined) {
        token.onboarded = session.user.onboarded as boolean;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.onboarded = Boolean(token.onboarded);
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const onboarded = auth?.user?.onboarded ?? false;
      const { pathname } = nextUrl;

      const isPublic =
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/auth") ||
        pathname === "/manifest.json" ||
        pathname === "/sw.js" ||
        pathname.startsWith("/icons");

      if (!isLoggedIn && !isPublic) {
        return false;
      }

      if (isLoggedIn && pathname === "/login") {
        return Response.redirect(new URL("/wheel", nextUrl));
      }

      if (
        isLoggedIn &&
        !onboarded &&
        pathname !== "/onboarding" &&
        !isPublic
      ) {
        return Response.redirect(new URL("/onboarding", nextUrl));
      }

      if (isLoggedIn && onboarded && pathname === "/onboarding") {
        return Response.redirect(new URL("/wheel", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
