import { getCachedSettingsData } from "@/lib/data/queries";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { requireUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await requireUser();
  const { spheres } = await getCachedSettingsData(user.id);

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <div className="px-6 pt-12 pb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--muted)] mb-1">
          {user.email}
        </p>
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
          Настройки
        </h1>
      </div>

      <div className="px-6">
        <SettingsForm spheres={spheres} />
      </div>
    </div>
  );
}
