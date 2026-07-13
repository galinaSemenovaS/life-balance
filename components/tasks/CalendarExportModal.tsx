"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarPlus, X } from "lucide-react";
import { markTaskCalendarExported } from "@/actions/goals";

type Props = {
  taskId: string;
  taskTitle: string;
  blockTitle: string;
  sphereName: string;
};

export function CalendarExportModal({ taskId, taskTitle, blockTitle, sphereName }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(taskTitle);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const details = `${sphereName} → ${blockTitle}`;

  function handleExport() {
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", title);
    url.searchParams.set("details", details);
    if (date) {
      const d = date.replace(/-/g, "");
      url.searchParams.set("dates", `${d}/${d}`);
    }
    window.open(url.toString(), "_blank", "noopener,noreferrer");

    startTransition(async () => {
      await markTaskCalendarExported(taskId, date || undefined);
    });
    setOpen(false);
  }

  const modal = open ? (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-[var(--surface)] rounded-t-3xl p-6 pb-10 space-y-5"
        style={{ maxHeight: "90dvh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base text-[var(--foreground)]">
            Добавить в Google Календарь
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-full hover:bg-[var(--background)] text-[var(--muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
              Название
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
              Дата
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
              Контекст
            </label>
            <p className="mt-1 text-sm text-[var(--muted)] bg-[var(--background)] rounded-xl px-4 py-2.5">
              {details}
            </p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="w-full rounded-xl bg-[var(--accent)] text-white font-semibold py-3 text-sm"
        >
          Открыть в Google Календаре
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--background)]"
        title="Добавить в Google Календарь"
      >
        <CalendarPlus className="w-3.5 h-3.5" />
      </button>
      {mounted && createPortal(modal, document.body)}
    </>
  );
}
