"use client";

import { Card } from "../card";
import { Typography } from "../typography";
import React from "react";

export const ChartTooltip = ({ active, payload, label, hideLabel }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card
        variant="primary"
        shape="minimal"
        padding="sm"
        elevation={2}
        className="min-w-[120px] !bg-surface-container-high/95 backdrop-blur-sm border border-outline-variant"
      >
        {!hideLabel && (
          <Typography variant="small" className="mb-2 font-bold opacity-70">
            {label}
          </Typography>
        )}
        <div className="flex flex-col gap-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="flex-1 text-xs font-medium text-on-surface">
                {entry.name}:
              </span>
              <span className="text-xs font-bold font-mono text-on-surface">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  return null;
};
