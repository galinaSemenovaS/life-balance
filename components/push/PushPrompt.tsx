"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { subscribeToPush, hasPushSubscription } from "@/components/push/subscribe";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";

export function PushPrompt() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    void (async () => {
      const subscribed = await hasPushSubscription();
      if (subscribed) return;

      if (Notification.permission === "granted") {
        const result = await subscribeToPush();
        if (result.ok) return;
      }

      if (Notification.permission === "denied") return;

      const dismissed = localStorage.getItem("push-prompt-dismissed");
      if (!dismissed) setVisible(true);
    })();
  }, []);

  const subscribe = async () => {
    setLoading(true);
    try {
      const result = await subscribeToPush();
      if (result.ok) {
        setVisible(false);
        return;
      }
      if (result.reason === "denied") {
        setVisible(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[calc(4.75rem+env(safe-area-inset-bottom))]"
      role="presentation"
    >
      <div
        role="dialog"
        aria-labelledby="push-prompt-title"
        className="pointer-events-auto relative animate-slide-up-in w-full max-w-lg rounded-sm border border-[var(--border)] bg-[var(--surface)] p-4"
      >
        <button
          type="button"
          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          onClick={() => {
            localStorage.setItem("push-prompt-dismissed", "1");
            setVisible(false);
          }}
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
          <div className="flex-1 space-y-2 pr-4">
            <p id="push-prompt-title" className="text-sm font-medium">
              Включить напоминания?
            </p>
            <p className="text-xs text-slate-500">
              На iOS добавьте приложение на экран «Домой», затем разрешите уведомления
            </p>
            <Button size="sm" onClick={subscribe} disabled={loading}>
              {loading ? "Подключение..." : "Разрешить"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
