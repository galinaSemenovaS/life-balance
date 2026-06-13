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
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--background)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-1.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[56px] flex-col items-center gap-0.5 rounded-sm px-2 py-2 text-[10px] font-medium uppercase tracking-wide transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                active
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  active && "scale-105"
                )}
                strokeWidth={active ? 2.25 : 1.75}
              />
              <span>{label}</span>
              {active ? (
                <span className="mt-0.5 h-0.5 w-4 bg-[var(--accent)]" aria-hidden />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
