"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import React from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number; // e.g., 12.5 for 12.5% or -5.2 for -5.2%
    label?: string; // e.g., "vs last month"
  };
  icon: ReactNode;
  variant?: "default" | "success" | "warning" | "info";
}

export function KpiCard({
  title,
  value,
  unit,
  trend,
  icon,
  variant = "default",
}: KpiCardProps) {
  // Modern AI-themed variant styles with better contrast and glow effects
  const variantStyles = {
    default: {
      card: "text-primary bg-white/40 backdrop-blur-md border-white/20 shadow-lg dark:text-white dark:bg-transparent dark:border-white/20",
      icon: "text-primary bg-gradient-to-br bg-indigo-300 to-indigo-200 dark:bg-indigo-600 dark:from-indigo-600 dark:to-indigo-400",
    },
    success: {
      card: "text-white from-emerald-400 to-emerald-200 border-emerald-400/40",
      icon: "text-white bg-emerald-500 text-emerald-950 shadow-lg",
    },
    warning: {
      card: "text-white from-orange-400 to-orange-200 border-orange-400/40",
      icon: "text-white bg-orange-500 text-orange-950 shadow-lg",
    },
    info: {
      card: "text-white from-cyan-400 to-cyan-200 border-cyan-400/40",
      icon: "text-white bg-cyan-500 text-cyan-950 shadow-lg",
    },
  };
  const trendDirection = trend
    ? trend.value > 0
      ? "up"
      : trend.value < 0
        ? "down"
        : "neutral"
    : null;
  const trendColor =
    trendDirection === "up"
      ? "text-emerald-400"
      : trendDirection === "down"
        ? "text-red-400"
        : "text-slate-400";

  const TrendIcon =
    trendDirection === "up"
      ? TrendingUp
      : trendDirection === "down"
        ? TrendingDown
        : Minus;

  return (
    <Card
      className={`bg-linear-to-br py-2 ${variantStyles[variant].card} border backdrop-blur-sm transition-all hover:shadow-lg hover:scale-[1.02]`}
    >
      <CardContent className="px-4 py-1 space-y-2">
        {/* Header row */}
        <div id="header" className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg backdrop-blur ${variantStyles[variant].icon}`}
            >
              {React.cloneElement(
                icon as React.ReactElement<{ className?: string }>,
                {
                  className: "h-5 w-5",
                },
              )}
            </div>
            <h3 className="text-sm font-medium">{title}</h3>
          </div>

          {/* Trend badge */}
          {trend && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/50 ${trendColor}`}
            >
              <TrendIcon className="h-3 w-3" />
              <span className="text-xs font-semibold">
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
            </div>
          )}
        </div>

        {/* Value */}
        <div id="value" className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight">{value}</span>
          {unit && <span className="text-lg font-medium">{unit}</span>}
        </div>

        {/* Trend label */}
        {trend?.label && (
          <p className="text-xs text-slate-400">{trend.label}</p>
        )}
      </CardContent>
    </Card>
  );
}
