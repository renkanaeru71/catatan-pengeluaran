"use client";

import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRupiah } from "@/lib/format";

export interface DailyBarDatum {
  /** Short day label shown under the bar, e.g. "Sen". */
  label: string;
  total: number;
  /** YYYY-MM-DD used to open the matching daily recap. */
  dateKey: string;
}

interface DailyBarChartProps {
  data: DailyBarDatum[];
  /** Highlight this bar (usually today or the selected day). */
  highlightDateKey?: string;
}

const PRIMARY = "var(--primary)";
const MUTED = "var(--chart-2, var(--muted-foreground))";

/** Weekly per-day spending, one bar per day. Clicking a bar opens that day. */
export function DailyBarChart({ data, highlightDateKey }: DailyBarChartProps) {
  const router = useRouter();

  function openDay(dateKey: string) {
    router.push(`/harian?date=${dateKey}`);
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 4, bottom: 0, left: 4 }}
          onClick={(state) => {
            const index =
              typeof state?.activeIndex === "number"
                ? state.activeIndex
                : typeof state?.activeTooltipIndex === "number"
                  ? state.activeTooltipIndex
                  : undefined;
            if (index !== undefined && data[index]) {
              openDay(data[index].dateKey);
            }
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stroke-border/60"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            className="fill-muted-foreground"
          />
          <YAxis
            width={44}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            tickFormatter={(value: number) => formatRupiah(value).replace("Rp ", "")}
            className="fill-muted-foreground"
          />
          <Tooltip
            cursor={{ className: "fill-muted/40" }}
            formatter={(value) => [formatRupiah(Number(value)), "Pengeluaran"]}
            labelFormatter={(_label, payload) => {
              const datum = payload?.[0]?.payload as DailyBarDatum | undefined;
              return datum ? `${datum.label} · ${datum.dateKey}` : "";
            }}
          />
          <Bar
            dataKey="total"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
            isAnimationActive={false}
            cursor="pointer"
          >
            {data.map((day) => (
              <Cell
                key={day.dateKey}
                fill={day.dateKey === highlightDateKey ? PRIMARY : MUTED}
                opacity={day.total === 0 ? 0.25 : 1}
                onClick={() => openDay(day.dateKey)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
