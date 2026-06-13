import Image from "next/image";
import { signIn } from "@/lib/auth";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { APP_TITLE_RU } from "@/lib/branding";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function signInWithGoogle(formData: FormData) {
  "use server";

  const callbackUrl = formData.get("callbackUrl");
  const redirectTo =
    typeof callbackUrl === "string" && callbackUrl.startsWith("/")
      ? callbackUrl
      : "/today";

  await signIn("google", { redirectTo });
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;
  const errorMessage = getAuthErrorMessage(error);
  const afterLogin = callbackUrl?.startsWith("/") ? callbackUrl : "/today";

  return (
    <div className="app-shell-bg flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-sm border-0 shadow-2xl shadow-slate-900/5 dark:shadow-black/20">
        <CardHeader className="items-center text-center">
          <Image
            src="/icons/icon-192.png"
            alt="Life Balance"
            width={80}
            height={80}
            className="mb-2 rounded-3xl shadow-lg ring-4 ring-slate-100 dark:ring-slate-800"
            priority
          />
          <CardTitle className="bg-gradient-to-r from-teal-700 to-teal-600 bg-clip-text text-transparent dark:from-teal-300 dark:to-teal-300">
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
          <form action={signInWithGoogle}>
            <input type="hidden" name="callbackUrl" value={afterLogin} />
            <GoogleSignInButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
