import { AppLogo } from "@/components/branding/AppLogo";
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
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <AppLogo size={80} className="mb-4" />
          <CardTitle className="font-display text-2xl">{APP_TITLE_RU}</CardTitle>
          <CardDescription>
            Оцени сферы жизни, ставь цели и отслеживай привычки каждый день
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage ? (
            <p
              role="alert"
              className="border border-[var(--destructive)] bg-[color-mix(in_srgb,var(--destructive)_10%,var(--surface))] px-3 py-2 text-sm text-[var(--destructive)]"
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
