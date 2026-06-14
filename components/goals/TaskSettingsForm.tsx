"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTask, updateTaskSettings } from "@/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CollapsibleForm } from "@/components/ui/collapsible-form";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { ItemReminderFields } from "@/components/ui/item-reminder-fields";
import { RecurrencePicker } from "@/components/ui/recurrence-picker";
import { parseRecurrenceJson } from "@/lib/recurrence";
import { toast } from "sonner";

type TaskSettingsFormProps = {
  taskId: string;
  title: string;
  dueDate: string | null;
  recurrence: unknown;
  reminderTime: string | null;
  reminderEnabled: boolean;
};

export function TaskSettingsForm({
  taskId,
  title,
  dueDate,
  recurrence,
  reminderTime,
  reminderEnabled,
}: TaskSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const defaultRecurrence = parseRecurrenceJson(recurrence);
  const anchorDate = dueDate ? dueDate.slice(0, 10) : null;

  return (
    <CollapsibleForm label="Настройки" hint="Название, повторение и напоминание">
      <form
        className="space-y-3"
        action={(formData) => {
          startTransition(async () => {
            try {
              await updateTaskSettings(taskId, {
                title: formData.get("title") as string,
                dueDate: (formData.get("dueDate") as string) || undefined,
                recurrenceJson: formData.get("recurrence") as string,
                reminderTime: (formData.get("reminderTime") as string) || null,
                reminderEnabled: formData.get("reminderEnabled") === "1",
                timezone: (formData.get("timezone") as string) || undefined,
              });
              toast.success("Задача обновлена");
              router.refresh();
            } catch {
              toast.error("Не удалось сохранить");
            }
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor={`task-title-${taskId}`}>Название</Label>
          <Input
            id={`task-title-${taskId}`}
            name="title"
            required
            defaultValue={title}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`dueDate-${taskId}`}>Дата</Label>
          <Input
            id={`dueDate-${taskId}`}
            name="dueDate"
            type="date"
            defaultValue={anchorDate ?? ""}
          />
        </div>
        <RecurrencePicker
          defaultValue={defaultRecurrence}
          anchorDate={anchorDate}
        />
        <ItemReminderFields
          defaultEnabled={reminderEnabled}
          defaultTime={reminderTime}
        />
        <Button type="submit" size="sm" className="w-full" disabled={pending}>
          Сохранить
        </Button>
      </form>

      <ConfirmDeleteButton
        label="Удалить задачу"
        onConfirm={async () => {
          try {
            await deleteTask(taskId);
            toast.success("Задача удалена");
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
