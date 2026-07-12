import { BottomNav } from "@/components/layout/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--background)] pb-[calc(4.75rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)]">
      <main className="mx-auto max-w-lg animate-float-in">{children}</main>
      <BottomNav />
    </div>
  );
}
