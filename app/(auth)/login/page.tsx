import Link from "next/link";
import Image from "next/image";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { APP_TITLE_RU } from "@/lib/branding";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;
  const errorMessage = getAuthErrorMessage(error);
  const afterLogin = callbackUrl?.startsWith("/") ? callbackUrl : "/today";
  const signInHref = `/api/auth/signin/google?${new URLSearchParams({
    callbackUrl: afterLogin,
  }).toString()}`;

  return (
    <div className="app-shell-bg flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-sm border-0 shadow-2xl shadow-emerald-900/10">
        <CardHeader className="items-center text-center">
          <Image
            src="/icons/icon-192.png"
            alt="Life Balance"
            width={80}
            height={80}
            className="mb-2 rounded-3xl shadow-lg ring-4 ring-emerald-100 dark:ring-emerald-950"
            priority
          />
          <CardTitle className="bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent dark:from-emerald-300 dark:to-teal-300">
            {APP_TITLE_RU}
          </CardTitle>
          <CardDescription>
            Оцени сферы жизни, ставь цели и отслеживай привычки каждый день
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
            >
              {errorMessage}
            </p>
          ) : null}
          <Button asChild className="w-full" size="lg">
            <Link href={signInHref}>Войти через Google</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
