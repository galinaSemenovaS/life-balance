"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteHabit, updateHabitSettings } from "@/actions/habits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CollapsibleForm } from "@/components/ui/collapsible-form";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { ItemReminderFields } from "@/components/ui/item-reminder-fields";
import { RecurrencePicker } from "@/components/ui/recurrence-picker";
import { parseRecurrenceJson } from "@/lib/recurrence";
import { toast } from "sonner";

type HabitSettingsFormProps = {
  habitId: string;
  title: string;
  description: string | null;
  schedule: unknown;
  reminderTime: string | null;
  reminderEnabled: boolean;
};

export function HabitSettingsForm({
  habitId,
  title,
  description,
  schedule,
  reminderTime,
  reminderEnabled,
}: HabitSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const defaultRecurrence = parseRecurrenceJson(schedule);

  return (
    <CollapsibleForm label="Настройки" hint="Название, описание, повторение">
      <form
        className="space-y-3"
        action={(formData) => {
          startTransition(async () => {
            try {
              await updateHabitSettings(habitId, {
                title: formData.get("title") as string,
                description: (formData.get("description") as string) || undefined,
                recurrenceJson: formData.get("recurrence") as string,
                reminderTime: (formData.get("reminderTime") as string) || null,
                reminderEnabled: formData.get("reminderEnabled") === "1",
                timezone: (formData.get("timezone") as string) || undefined,
              });
              toast.success("Привычка обновлена");
              router.refresh();
            } catch {
              toast.error("Не удалось сохранить");
            }
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor={`habit-title-${habitId}`}>Название</Label>
          <Input
            id={`habit-title-${habitId}`}
            name="title"
            required
            defaultValue={title}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`habit-description-${habitId}`}>Описание</Label>
          <Textarea
            id={`habit-description-${habitId}`}
            name="description"
            rows={2}
            defaultValue={description ?? ""}
            placeholder="Зачем эта привычка?"
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

      <ConfirmDeleteButton
        label="Удалить привычку"
        onConfirm={async () => {
          try {
            await deleteHabit(habitId);
            toast.success("Привычка удалена");
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
