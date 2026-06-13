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
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/50 px-6 py-10 text-center dark:border-slate-700/60 dark:bg-slate-900/30",
        className
      )}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <Icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
