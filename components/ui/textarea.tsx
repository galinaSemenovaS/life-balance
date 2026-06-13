import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-[88px] w-full rounded-sm border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-[var(--muted)] focus-visible:border-[var(--foreground)] focus-visible:ring-1 focus-visible:ring-[var(--foreground)]",
        className
      )}
      {...props}
    />
  );
}
