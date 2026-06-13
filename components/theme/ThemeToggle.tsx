"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tapScale } from "@/lib/ui-classes";

const OPTIONS = [
  { value: "light", label: "Светлая", icon: Sun },
  { value: "dark", label: "Тёмная", icon: Moon },
  { value: "system", label: "Системная", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ label }) => (
          <div
            key={label}
            className="h-11 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <Button
            key={value}
            type="button"
            variant={active ? "default" : "outline"}
            className={cn("flex flex-col gap-1 py-3 h-auto", tapScale)}
            onClick={() => setTheme(value)}
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs">{label}</span>
          </Button>
        );
      })}
    </div>
  );
}
