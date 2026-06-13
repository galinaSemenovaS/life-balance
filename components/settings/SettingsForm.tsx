"use client";

import { useState, useTransition } from "react";
import { updateNotificationPreferences } from "@/actions/settings";
import { renameSphere } from "@/actions/spheres";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ResetWheelSection } from "@/components/settings/ResetWheelSection";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export function SettingsForm({
  spheres,
  preferences,
}: {
  spheres: { id: string; name: string }[];
  preferences: {
    habitsEnabled: boolean;
    wheelReviewEnabled: boolean;
    wheelReviewDay: number;
    wheelReviewTime: string;
  };
}) {
  const [pending, startTransition] = useTransition();
  const [habitsEnabled, setHabitsEnabled] = useState(preferences.habitsEnabled);
  const [wheelReviewEnabled, setWheelReviewEnabled] = useState(
    preferences.wheelReviewEnabled
  );
  const [wheelReviewDay, setWheelReviewDay] = useState(preferences.wheelReviewDay);
  const [wheelReviewTime, setWheelReviewTime] = useState(preferences.wheelReviewTime);

  const saveNotifications = () => {
    startTransition(async () => {
      await updateNotificationPreferences({
        habitsEnabled,
        wheelReviewEnabled,
        wheelReviewDay,
        wheelReviewTime,
      });
      toast.success("Настройки сохранены");
    });
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-3">
        <h3 className="font-semibold">Тема</h3>
        <p className="text-xs text-slate-500">Выберите светлую, тёмную или системную</p>
        <ThemeToggle />
      </Card>

      <ResetWheelSection />

      <Card className="space-y-4">
        <h3 className="font-semibold">Уведомления</h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="habitsEnabled">Напоминания о привычках</Label>
          <Switch
            id="habitsEnabled"
            checked={habitsEnabled}
            onCheckedChange={setHabitsEnabled}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="wheelReviewEnabled">Пересмотр колеса</Label>
          <Switch
            id="wheelReviewEnabled"
            checked={wheelReviewEnabled}
            onCheckedChange={setWheelReviewEnabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wheelReviewDay">День пересмотра</Label>
          <select
            id="wheelReviewDay"
            value={wheelReviewDay}
            onChange={(e) => setWheelReviewDay(Number(e.target.value))}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            {DAYS.map((day, i) => (
              <option key={day} value={i}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="wheelReviewTime">Время</Label>
          <Input
            id="wheelReviewTime"
            type="time"
            value={wheelReviewTime}
            onChange={(e) => setWheelReviewTime(e.target.value)}
          />
        </div>
        <Button className="w-full" disabled={pending} onClick={saveNotifications}>
          Сохранить уведомления
        </Button>
      </Card>

      <Card className="space-y-4">
        <h3 className="font-semibold">Названия сфер</h3>
        {spheres.map((sphere) => (
          <form
            key={sphere.id}
            className="flex gap-2"
            action={(formData) => {
              startTransition(async () => {
                await renameSphere(sphere.id, formData.get("name") as string);
                toast.success("Сфера переименована");
              });
            }}
          >
            <Input name="name" defaultValue={sphere.name} required />
            <Button type="submit" size="sm" variant="secondary" disabled={pending}>
              OK
            </Button>
          </form>
        ))}
      </Card>
    </div>
  );
}
