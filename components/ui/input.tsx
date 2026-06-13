import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-teal-500 placeholder:text-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950",
        className
      )}
      {...props}
    />
  );
}
