"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronDown, ChevronUp } from "lucide-react";

type JournalEntry = {
  id: string;
  score: number;
  description: string | null;
  assessment: { createdAt: Date };
};

type Props = {
  entries: JournalEntry[];
  sphereColor: string;
};

export function SphereJournal({ entries, sphereColor }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (entries.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)] text-center py-6">
        Пока нет записей. Оцените сферу выше, чтобы начать историю.
      </p>
    );
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isOpen = expanded.has(entry.id);
        const hasDesc = !!entry.description;
        return (
          <div
            key={entry.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
          >
            <button
              onClick={() => hasDesc && toggle(entry.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: sphereColor }}
              >
                {entry.score}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {format(new Date(entry.assessment.createdAt), "d MMMM yyyy", { locale: ru })}
                </p>
                {!isOpen && entry.description && (
                  <p className="text-xs text-[var(--muted)] truncate mt-0.5">
                    {entry.description}
                  </p>
                )}
              </div>
              {hasDesc && (
                <span className="text-[var(--muted)] shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              )}
            </button>
            {isOpen && entry.description && (
              <div className="px-4 pb-4">
                <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                  {entry.description}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
