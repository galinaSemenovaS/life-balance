import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--foreground)]">
        {title}
      </h1>
      {subtitle ? (
        <p className="text-sm text-[var(--muted)]">{subtitle}</p>
      ) : null}
      <div className="h-px w-12 bg-[var(--accent)]" aria-hidden />
    </div>
  );
}
