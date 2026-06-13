import { getCachedSettingsData } from "@/lib/data/queries";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signOut } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await getSessionUser();
  const { prefs, spheres } = await getCachedSettingsData(user.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Настройки" subtitle={user.email ?? undefined} />

      <Card className="space-y-2">
        <p className="text-sm font-medium">Профиль</p>
        <p className="text-sm text-slate-500">{user.name ?? "Пользователь"}</p>
      </Card>

      <SettingsForm
        spheres={spheres}
        preferences={{
          wheelReviewEnabled: prefs?.wheelReviewEnabled ?? true,
          wheelReviewDay: prefs?.wheelReviewDay ?? 0,
          wheelReviewTime: prefs?.wheelReviewTime ?? "10:00",
        }}
      />

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <Button type="submit" variant="outline" className="w-full">
          Выйти
        </Button>
      </form>
    </div>
  );
}
