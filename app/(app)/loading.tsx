import { AppLogo } from "@/components/branding/AppLogo";

export default function AppLoading() {
  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-6 py-12">
      <AppLogo size={72} withBackground className="animate-pulse" />
      <p className="font-display text-lg text-[var(--muted)]">Загрузка…</p>
    </div>
  );
}
