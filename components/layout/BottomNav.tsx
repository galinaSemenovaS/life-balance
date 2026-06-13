"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarCheck,
  CircleDot,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tapScale } from "@/lib/ui-classes";

const items = [
  { href: "/today", label: "Сегодня", icon: CalendarCheck },
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/spheres", label: "Сферы", icon: CircleDot },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/40 bg-white/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[56px] flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium transition-all",
                tapScale,
                active
                  ? "bg-teal-100/90 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
