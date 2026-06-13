"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export type WheelDataPoint = {
  name: string;
  score: number;
  color: string;
  sphereId?: string;
};

type WheelChartProps = {
  data: WheelDataPoint[];
  size?: "sm" | "md" | "lg";
  selectedSphereId?: string | null;
  onSphereSelect?: (sphereId: string) => void;
  className?: string;
  hideFooter?: boolean;
  fullBleed?: boolean;
};

const sizes = {
  sm: 220,
  md: 280,
  lg: 360,
};

export function WheelChart({
  data,
  size = "md",
  selectedSphereId,
  onSphereSelect,
  className,
  hideFooter = false,
  fullBleed = false,
}: WheelChartProps) {
  const [mounted, setMounted] = useState(false);
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const dimension = sizes[size];
  const selected = selectedSphereId ?? internalSelected;

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data.map((d) => ({
    ...d,
    fullMark: 10,
  }));

  const handleSelect = (point: WheelDataPoint) => {
    if (!point.sphereId) return;
    setInternalSelected(point.sphereId);
    onSphereSelect?.(point.sphereId);
  };

  return (
    <div
      className={cn(
        "w-full min-w-0",
        fullBleed && "-mx-2",
        className
      )}
    >
      <div
        className="flex w-full justify-center"
        style={{ height: dimension }}
      >
        {mounted ? (
          <RadarChart
            width={dimension}
            height={dimension}
            cx={dimension / 2}
            cy={dimension / 2}
            outerRadius={dimension * 0.36}
            data={chartData}
          >
            <PolarGrid
              stroke="var(--border)"
              gridType="polygon"
              radialLines={true}
            />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: "var(--muted)", fontSize: 10, fontFamily: "inherit" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tickCount={6}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 9, fontFamily: "inherit" }}
            />
            <Radar
              name="Оценка"
              dataKey="score"
              stroke="var(--foreground)"
              fill="var(--accent)"
              fillOpacity={0.12}
              strokeWidth={1.5}
              isAnimationActive
              animationDuration={300}
              animationEasing="ease-out"
              dot={(props) => {
                const { cx, cy, payload, index } = props;
                if (cx == null || cy == null) return null;

                const point = payload as WheelDataPoint;
                const isActive = selected === point.sphereId;

                return (
                  <g
                    key={index}
                    onClick={() => handleSelect(point)}
                    style={{ cursor: point.sphereId ? "pointer" : "default" }}
                  >
                    <circle cx={cx} cy={cy} r={24} fill="transparent" />
                    {isActive && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={16}
                        fill={point.color}
                        fillOpacity={0.18}
                        className="sphere-dot-active"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isActive ? 8 : 5}
                      fill={point.color}
                      stroke="var(--surface)"
                      strokeWidth={2}
                      className={cn(
                        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        isActive && "sphere-dot-active"
                      )}
                    />
                  </g>
                );
              }}
            />
          </RadarChart>
        ) : (
          <div
            className="border border-[var(--border)] bg-[var(--surface)]"
            style={{ width: dimension, height: dimension }}
          />
        )}
      </div>
      {!hideFooter && selected && (
        <p className="mt-2 text-center text-sm text-[var(--muted)]">
          {data.find((d) => d.sphereId === selected)?.name}:{" "}
          <span className="font-display font-semibold text-[var(--foreground)]">
            {data.find((d) => d.sphereId === selected)?.score}/10
          </span>
        </p>
      )}
    </div>
  );
}
