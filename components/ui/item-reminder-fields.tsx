"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type ItemReminderFieldsProps = {
  defaultEnabled?: boolean;
  defaultTime?: string | null;
  enabledName?: string;
  timeName?: string;
};

export function ItemReminderFields({
  defaultEnabled = false,
  defaultTime = "",
  enabledName = "reminderEnabled",
  timeName = "reminderTime",
}: ItemReminderFieldsProps) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label htmlFor={enabledName}>Push-напоминание</Label>
          <p className="text-xs text-slate-500">Отдельно для этой записи</p>
        </div>
        <Switch
          id={enabledName}
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>
      <input type="hidden" name={enabledName} value={enabled ? "1" : "0"} />
      <div className="space-y-2">
        <Label htmlFor={timeName}>Время</Label>
        <Input
          id={timeName}
          name={timeName}
          type="time"
          defaultValue={defaultTime ?? ""}
          disabled={!enabled}
        />
      </div>
    </div>
  );
}
