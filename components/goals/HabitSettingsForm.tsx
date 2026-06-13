"use client";

import { useTransition } from "react";
import { updateHabitSettings } from "@/actions/habits";
import { Button } from "@/components/ui/button";
import { CollapsibleForm } from "@/components/ui/collapsible-form";
import { ItemReminderFields } from "@/components/ui/item-reminder-fields";
import { RecurrencePicker } from "@/components/ui/recurrence-picker";
import { parseRecurrenceJson } from "@/lib/recurrence";
import { toast } from "sonner";

type HabitSettingsFormProps = {
  habitId: string;
  schedule: unknown;
  reminderTime: string | null;
  reminderEnabled: boolean;
};

export function HabitSettingsForm({
  habitId,
  schedule,
  reminderTime,
  reminderEnabled,
}: HabitSettingsFormProps) {
  const [pending, startTransition] = useTransition();
  const defaultRecurrence = parseRecurrenceJson(schedule);

  return (
    <CollapsibleForm label="Настройки" hint="Повторение и напоминание">
      <form
        className="space-y-3"
        action={(formData) => {
          startTransition(async () => {
            try {
              await updateHabitSettings(habitId, {
                recurrenceJson: formData.get("recurrence") as string,
                reminderTime: (formData.get("reminderTime") as string) || null,
                reminderEnabled: formData.get("reminderEnabled") === "1",
              });
              toast.success("Привычка обновлена");
            } catch {
              toast.error("Не удалось сохранить");
            }
          });
        }}
      >
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
