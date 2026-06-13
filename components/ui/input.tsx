import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-sm border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-[var(--muted)] focus-visible:border-[var(--foreground)] focus-visible:ring-1 focus-visible:ring-[var(--foreground)]",
        className
      )}
      {...props}
    />
  );
}
