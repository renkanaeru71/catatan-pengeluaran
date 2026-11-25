"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const PRESET_COLORS = [
  "#f59e0b", // Amber (Makan)
  "#3b82f6", // Blue (Transport)
  "#8b5cf6", // Violet (Belanja)
  "#ef4444", // Red (Tagihan)
  "#ec4899", // Pink (Hiburan)
  "#10b981", // Emerald (Kesehatan)
  "#06b6d4", // Cyan (Pendidikan)
  "#64748b", // Slate (Lainnya)
  "#f97316", // Orange
  "#84cc16", // Lime
  "#14b8a6", // Teal
  "#a855f7", // Purple
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const current = value.toLowerCase();
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_COLORS.map((hex) => {
        const isSelected = hex.toLowerCase() === current;
        return (
          <button
            key={hex}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`Warna ${hex}`}
            onClick={() => onChange(hex)}
            className={cn(
              "relative flex size-8 items-center justify-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSelected && "scale-110 ring-2 ring-ring ring-offset-2",
            )}
            style={{ backgroundColor: hex }}
          >
            {isSelected && <Check className="size-4 text-white drop-shadow" />}
          </button>
        );
      })}
    </div>
  );
}
