import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 dark:shadow-emerald-900/30",
        secondary:
          "bg-white/80 text-slate-900 shadow-sm hover:bg-white dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800",
        outline:
          "border border-slate-200/80 bg-white/50 hover:bg-white dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-900",
        ghost: "hover:bg-emerald-50 dark:hover:bg-emerald-950/40",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20 hover:from-red-500 hover:to-rose-500",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}
