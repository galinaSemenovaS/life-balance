"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CollapsibleForm({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        className={cn("w-full justify-start gap-2 border-dashed", className)}
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4 shrink-0 text-teal-600" />
        <span>{label}</span>
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{label}</h3>
          {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-slate-500"
          onClick={() => setOpen(false)}
        >
          <ChevronDown className="h-4 w-4" />
          Свернуть
        </Button>
      </div>
      {children}
    </div>
  );
}
