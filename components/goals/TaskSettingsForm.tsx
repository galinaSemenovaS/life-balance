"use client";

import { useTransition } from "react";
import { updateTaskSettings } from "@/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CollapsibleForm } from "@/components/ui/collapsible-form";
import { ItemReminderFields } from "@/components/ui/item-reminder-fields";
import { RecurrencePicker } from "@/components/ui/recurrence-picker";
import { parseRecurrenceJson } from "@/lib/recurrence";
import { toast } from "sonner";

type TaskSettingsFormProps = {
  taskId: string;
  dueDate: string | null;
  recurrence: unknown;
  reminderTime: string | null;
  reminderEnabled: boolean;
};

export function TaskSettingsForm({
  taskId,
  dueDate,
  recurrence,
  reminderTime,
  reminderEnabled,
}: TaskSettingsFormProps) {
  const [pending, startTransition] = useTransition();
  const defaultRecurrence = parseRecurrenceJson(recurrence);

  return (
    <CollapsibleForm label="Настройки" hint="Повторение и напоминание">
      <form
        className="space-y-3"
        action={(formData) => {
          startTransition(async () => {
            try {
              await updateTaskSettings(taskId, {
                dueDate: (formData.get("dueDate") as string) || undefined,
                recurrenceJson: formData.get("recurrence") as string,
                reminderTime: (formData.get("reminderTime") as string) || null,
                reminderEnabled: formData.get("reminderEnabled") === "1",
                timezone: (formData.get("timezone") as string) || undefined,
              });
              toast.success("Задача обновлена");
            } catch {
              toast.error("Не удалось сохранить");
            }
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor={`dueDate-${taskId}`}>Дата</Label>
          <Input
            id={`dueDate-${taskId}`}
            name="dueDate"
            type="date"
            defaultValue={dueDate ? dueDate.slice(0, 10) : ""}
          />
        </div>
        <RecurrencePicker defaultValue={defaultRecurrence} />
        <ItemReminderFields
          defaultEnabled={reminderEnabled}
          defaultTime={reminderTime}
        />
        <Button type="submit" size="sm" className="w-full" disabled={pending}>
          Сохранить
        </Button>
      </form>
    </CollapsibleForm>
  );
}
