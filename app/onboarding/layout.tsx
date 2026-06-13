export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-slate-50 px-4 py-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] dark:bg-slate-900">
      <div className="mx-auto max-w-lg">{children}</div>
    </div>
  );
}
