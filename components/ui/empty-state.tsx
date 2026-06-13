import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border border-dashed border-[var(--border)] bg-[color-mix(in_srgb,var(--foreground)_2%,var(--surface))] px-6 py-10 text-center",
        className
      )}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center border border-[var(--border)] bg-[var(--surface)]">
        <Icon className="h-5 w-5 text-[var(--foreground)]" />
      </div>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-xs text-sm text-[var(--muted)]">{description}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
