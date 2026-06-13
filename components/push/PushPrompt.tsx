"use client";

import { useEffect, useState } from "react";
import { subscribeToPush, hasPushSubscription } from "@/components/push/subscribe";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";

export function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-950">
      <button
        type="button"
        className="absolute right-3 top-3 text-slate-400"
        onClick={() => {
          localStorage.setItem("push-prompt-dismissed", "1");
          setVisible(false);
        }}
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 text-teal-600" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium">Включить напоминания?</p>
          <p className="text-xs text-slate-500">
            На iOS добавьте приложение на экран «Домой», затем разрешите уведомления
          </p>
          <Button size="sm" onClick={subscribe} disabled={loading}>
            {loading ? "Подключение..." : "Разрешить"}
          </Button>
        </div>
      </div>
    </div>
  );
}
