"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatRupiah } from "@/lib/format";
import type { CategoryTotal } from "@/lib/stats";

interface CategoryDonutProps {
  items: CategoryTotal[];
}

/**
 * Monthly category share as a donut. The centre shows the summed total so the
 * ring and the number always agree; the legend below carries names, amounts and
 * percentages (a donut alone is hard to read on small screens).
 */
export function CategoryDonut({ items }: CategoryDonutProps) {
  const total = items.reduce((sum, item) => sum + item.total, 0);

  if (items.length === 0 || total === 0) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        Belum ada pengeluaran pada bulan ini.
      </p>
    );
  }

  const data = items.map((item) => ({
    name: item.name,
    value: item.total,
    color: item.color,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto h-48 w-full max-w-xs">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                formatRupiah(Number(value)),
                String(name),
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Centre label, positioned over the ring hole. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
            Total
          </span>
          <span className="text-sm font-bold tabular-nums">
            {formatRupiah(total)}
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const percent = (item.total / total) * 100;
          return (
            <li
              key={item.categoryId}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-muted-foreground text-xs tabular-nums">
                  {percent.toFixed(1)}%
                </span>
                <span className="font-medium tabular-nums">
                  {formatRupiah(item.total)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
