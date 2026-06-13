import { signIn } from "@/lib/auth";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDot } from "lucide-react";

async function signInWithGoogle() {
  "use server";
  await signIn("google", { redirectTo: "/" });
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-sm border-0 shadow-xl">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950">
            <CircleDot className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle>Колесо баланса</CardTitle>
          <CardDescription>
            Оцени сферы жизни, ставь цели и отслеживай привычки каждый день
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signInWithGoogle}>
            <GoogleSignInButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
