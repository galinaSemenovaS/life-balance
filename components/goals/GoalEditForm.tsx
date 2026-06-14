"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGoal, updateGoal } from "@/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CollapsibleForm } from "@/components/ui/collapsible-form";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { toast } from "sonner";

type GoalEditFormProps = {
  goalId: string;
  sphereId: string;
  title: string;
  description: string | null;
  deadline: string | null;
  status: string;
};

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Активна" },
  { value: "PAUSED", label: "На паузе" },
  { value: "COMPLETED", label: "Завершена" },
] as const;

export function GoalEditForm({
  goalId,
  sphereId,
  title,
  description,
  deadline,
  status,
}: GoalEditFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <CollapsibleForm label="Редактировать цель" hint="Название, дедлайн и статус">
      <form
        className="space-y-3"
        action={(formData) => {
          startTransition(async () => {
            try {
              await updateGoal(goalId, {
                title: formData.get("title") as string,
                description: (formData.get("description") as string) || undefined,
                deadline: (formData.get("deadline") as string) || undefined,
                status: formData.get("status") as "ACTIVE" | "PAUSED" | "COMPLETED",
              });
              toast.success("Цель обновлена");
              router.refresh();
            } catch {
              toast.error("Не удалось сохранить");
            }
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="edit-goal-title">Название</Label>
          <Input
            id="edit-goal-title"
            name="title"
            required
            defaultValue={title}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-goal-description">Описание</Label>
          <Textarea
            id="edit-goal-description"
            name="description"
            rows={2}
            defaultValue={description ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-goal-deadline">Дедлайн</Label>
          <Input
            id="edit-goal-deadline"
            name="deadline"
            type="date"
            defaultValue={deadline ? deadline.slice(0, 10) : ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-goal-status">Статус</Label>
          <select
            id="edit-goal-status"
            name="status"
            defaultValue={status}
            className="flex h-11 w-full rounded-sm border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus-visible:border-[var(--foreground)] focus-visible:ring-1 focus-visible:ring-[var(--foreground)]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Сохранение..." : "Сохранить"}
        </Button>
      </form>

      <ConfirmDeleteButton
        label="Удалить цель"
        confirmLabel="Да, удалить цель"
        onConfirm={async () => {
          try {
            await deleteGoal(goalId);
            toast.success("Цель удалена");
            router.push(`/spheres/${sphereId}`);
            router.refresh();
          } catch {
            toast.error("Не удалось удалить");
            throw new Error("delete failed");
          }
        }}
      />
    </CollapsibleForm>
  );
}
