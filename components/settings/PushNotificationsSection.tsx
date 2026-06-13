"use client";

import { useEffect, useState, useTransition } from "react";
import { subscribeToPush, hasPushSubscription } from "@/components/push/subscribe";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

type PushStatus = "loading" | "unsupported" | "denied" | "subscribed" | "ready";

export function PushNotificationsSection() {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    async function check() {
      if (!("Notification" in window) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }
      const subscribed = await hasPushSubscription();
      setStatus(subscribed ? "subscribed" : "ready");
    }
    void check();
  }, []);

  const enablePush = () => {
    startTransition(async () => {
      const result = await subscribeToPush();
      if (result.ok) {
        setStatus("subscribed");
        toast.success("Push-уведомления включены");
        return;
      }
      if (result.reason === "denied") {
        setStatus("denied");
        toast.error("Разрешите уведомления в настройках браузера");
        return;
      }
      if (result.reason === "unsupported") {
        setStatus("unsupported");
        toast.error("Push не поддерживается в этом браузере");
        return;
      }
      if (result.reason === "no-vapid") {
        toast.error("Push не настроен на сервере (VAPID keys)");
        return;
      }
      toast.error("Не удалось подключить push");
    });
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        {status === "subscribed" ? (
          <Bell className="mt-0.5 h-5 w-5 text-teal-600" />
        ) : (
          <BellOff className="mt-0.5 h-5 w-5 text-slate-400" />
        )}
        <div className="space-y-1">
          <h3 className="font-semibold">Push-уведомления</h3>
          <p className="text-xs text-slate-500">
            {status === "loading" && "Проверяем подписку…"}
            {status === "unsupported" &&
              "Не поддерживается. На iOS добавьте приложение на экран «Домой»."}
            {status === "denied" &&
              "Уведомления заблокированы в браузере. Разрешите их в настройках сайта."}
            {status === "subscribed" &&
              "Подключено. Напоминания приходят по времени из каждой задачи/привычки."}
            {status === "ready" &&
              "Разрешите push, затем включите напоминание у нужной задачи или привычки."}
          </p>
        </div>
      </div>
      {status === "ready" || status === "subscribed" ? (
        <Button
          type="button"
          variant={status === "subscribed" ? "outline" : "default"}
          className="w-full"
          disabled={pending || status === "subscribed"}
          onClick={enablePush}
        >
          {pending
            ? "Подключение..."
            : status === "subscribed"
              ? "Push подключён"
              : "Включить push"}
        </Button>
      ) : null}
    </Card>
  );
}
