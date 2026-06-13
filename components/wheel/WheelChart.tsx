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
};

const sizes = {
  sm: 220,
  md: 280,
  lg: 340,
};

export function WheelChart({
  data,
  size = "md",
  selectedSphereId,
  onSphereSelect,
  className,
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
    <div className={cn("w-full min-w-0", className)}>
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
            <PolarGrid stroke="#e2e8f0" gridType="polygon" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: "#64748b", fontSize: 10 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tickCount={6}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 9 }}
            />
            <Radar
              name="Оценка"
              dataKey="score"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.25}
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload, index } = props;
                if (cx == null || cy == null) return null;

                const point = payload as WheelDataPoint;
                const isActive = selected === point.sphereId;

                return (
                  <g
                    key={index}
                    onClick={() => handleSelect(point)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isActive ? 8 : 5}
                      fill={point.color}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                    {isActive && (
                      <text
                        x={cx}
                        y={cy - 16}
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize={14}
                        fontWeight={700}
                      >
                        {point.score}
                      </text>
                    )}
                  </g>
                );
              }}
            />
          </RadarChart>
        ) : (
          <div style={{ width: dimension, height: dimension }} />
        )}
      </div>
      {selected && (
        <p className="mt-1 text-center text-sm text-slate-500">
          {data.find((d) => d.sphereId === selected)?.name}:{" "}
          <span className="font-semibold text-emerald-600">
            {data.find((d) => d.sphereId === selected)?.score}/10
          </span>
        </p>
      )}
    </div>
  );
}
