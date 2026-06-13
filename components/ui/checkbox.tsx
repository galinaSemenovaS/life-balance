"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer h-5 w-5 shrink-0 rounded-md border border-slate-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600 data-[state=checked]:text-white dark:border-slate-600 dark:ring-offset-slate-950",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="h-3.5 w-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
