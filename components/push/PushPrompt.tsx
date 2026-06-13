"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "granted") return;
    const dismissed = localStorage.getItem("push-prompt-dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  const subscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setVisible(false);
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.warn("VAPID public key missing");
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = subscription.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      setVisible(false);
    } catch (e) {
      console.error(e);
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
