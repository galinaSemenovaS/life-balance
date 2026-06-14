"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmDeleteButtonProps = {
  label: string;
  confirmLabel?: string;
  pendingLabel?: string;
  confirmHint?: string;
  onConfirm: () => Promise<void>;
  className?: string;
  fullWidth?: boolean;
};

export function ConfirmDeleteButton({
  label,
  confirmLabel = "Да, удалить",
  pendingLabel = "Удаление...",
  confirmHint = "Это действие необратимо. Нажмите ещё раз, чтобы подтвердить.",
  onConfirm,
  className,
  fullWidth = true,
}: ConfirmDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    startTransition(async () => {
      try {
        await onConfirm();
      } finally {
        setConfirming(false);
      }
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {confirming ? (
        <p className="border border-[var(--destructive)] bg-[color-mix(in_srgb,var(--destructive)_8%,var(--surface))] px-3 py-2 text-xs text-[var(--destructive)]">
          {confirmHint}
        </p>
      ) : null}
      <div className="flex gap-2">
        {confirming ? (
          <Button
            type="button"
            variant="outline"
            className={cn(fullWidth && "flex-1")}
            disabled={pending}
            onClick={() => setConfirming(false)}
          >
            Отмена
          </Button>
        ) : null}
        <Button
          type="button"
          variant="destructive"
          className={cn(fullWidth && (confirming ? "flex-1" : "w-full"))}
          disabled={pending}
          onClick={handleClick}
        >
          {pending ? pendingLabel : confirming ? confirmLabel : label}
        </Button>
      </div>
    </div>
  );
}
