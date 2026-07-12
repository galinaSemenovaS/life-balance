"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Target, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/wheel", label: "Колесо", icon: Target },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href === "/wheel" && pathname.startsWith("/spheres")) ||
            pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-6 py-2 rounded-2xl text-[11px] font-medium transition-all duration-200",
                active
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon
                className="h-6 w-6"
                strokeWidth={active ? 2 : 1.5}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
