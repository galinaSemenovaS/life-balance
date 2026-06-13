import { BottomNav } from "@/components/layout/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell-bg min-h-dvh pb-[calc(4.75rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)]">
      <main className="mx-auto max-w-lg px-4 py-6 animate-float-in">{children}</main>
      <BottomNav />
    </div>
  );
}
