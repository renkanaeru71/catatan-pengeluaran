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

export interface MonthlyDailyDatum {
  /** Day of month, 1..31. */
  label: string;
  total: number;
  dateKey: string;
}

interface MonthlyDailyChartProps {
  data: MonthlyDailyDatum[];
  highlightDateKey?: string;
}

const PRIMARY = "var(--primary)";
const MUTED = "var(--chart-2, var(--muted-foreground))";

/** Per-day spending for a whole month; clicking a bar opens that day's recap. */
export function MonthlyDailyChart({
  data,
  highlightDateKey,
}: MonthlyDailyChartProps) {
  const router = useRouter();

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stroke-border/60"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10 }}
            interval={Math.max(Math.floor(data.length / 10) - 1, 0)}
            className="fill-muted-foreground"
          />
          <YAxis
            width={44}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            tickFormatter={(value: number) =>
              formatRupiah(value).replace("Rp ", "")
            }
            className="fill-muted-foreground"
          />
          <Tooltip
            cursor={{ className: "fill-muted/40" }}
            formatter={(value) => [formatRupiah(Number(value)), "Pengeluaran"]}
            labelFormatter={(_label, payload) => {
              const datum = payload?.[0]?.payload as
                | MonthlyDailyDatum
                | undefined;
              return datum ? `Tanggal ${datum.label}` : "";
            }}
          />
          <Bar
            dataKey="total"
            radius={[3, 3, 0, 0]}
            maxBarSize={16}
            isAnimationActive={false}
            cursor="pointer"
          >
            {data.map((day) => (
              <Cell
                key={day.dateKey}
                fill={day.dateKey === highlightDateKey ? PRIMARY : MUTED}
                opacity={day.total === 0 ? 0.2 : 1}
                onClick={() => router.push(`/harian?date=${day.dateKey}`)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
