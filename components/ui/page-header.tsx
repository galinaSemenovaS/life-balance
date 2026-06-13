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
    <div className={cn("space-y-1", className)}>
      <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent dark:from-teal-300 dark:via-teal-300 dark:to-cyan-300">
        {title}
      </h1>
      {subtitle ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      ) : null}
    </div>
  );
}
