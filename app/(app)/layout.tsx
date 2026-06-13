import { AppShell } from "@/components/layout/AppShell";
import { PushPrompt } from "@/components/push/PushPrompt";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      {children}
      <PushPrompt />
    </AppShell>
  );
}
