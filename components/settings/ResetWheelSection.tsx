"use client";

import { useState, useTransition } from "react";
import { resetLifeBalance } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

export function ResetWheelSection() {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleReset = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    startTransition(async () => {
      try {
        await resetLifeBalance();
      } catch {
        toast.error("Не удалось сбросить данные");
        setConfirming(false);
      }
    });
  };

  return (
    <Card className="space-y-3 border-red-200/60 bg-red-50/30 dark:border-red-900/40 dark:bg-red-950/20">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950">
          <RotateCcw className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold">Сбросить колесо</h3>
          <p className="text-xs leading-relaxed text-slate-500">
            Удалит все цели, привычки, задачи и оценки. Сферы останутся — вы
            пройдёте онбординг заново.
          </p>
        </div>
      </div>

      {confirming ? (
        <p className="rounded-xl bg-red-100/80 px-3 py-2 text-xs font-medium text-red-800 dark:bg-red-950/60 dark:text-red-200">
          Это действие необратимо. Нажмите ещё раз, чтобы подтвердить.
        </p>
      ) : null}

      <div className="flex gap-2">
        {confirming ? (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={pending}
            onClick={() => setConfirming(false)}
          >
            Отмена
          </Button>
        ) : null}
        <Button
          type="button"
          variant="destructive"
          className="flex-1"
          disabled={pending}
          onClick={handleReset}
        >
          {pending ? "Сброс..." : confirming ? "Да, сбросить всё" : "Сбросить колесо"}
        </Button>
      </div>
    </Card>
  );
}
