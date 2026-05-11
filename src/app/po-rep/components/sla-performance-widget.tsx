"use client";

import { ChartTooltip } from "@/components/chart-tooltip";
import { Card } from "@/components/ui/card";
import { isSameMonth, isValidDate } from "@/lib/utils";
import { startOfDay, sub } from "date-fns";
import { useCallback, type ComponentProps } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CardProps = ComponentProps<typeof Card>;
export type SLAPerformanceWidgetProps = Omit<CardProps, "children">;

interface ChartEntry {
  date: string;
  a: number;
  b: number;
  c: number;
  d: number;
}

const dateMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const chartData: ChartEntry[] = [...new Array(20)].map((_, index, array) => {
  const date = startOfDay(
    sub(new Date(), { days: array.length - index })
  ).toISOString();

  return generateChartEntry(date, 10);
});

function generateChartEntry(
  date: ChartEntry["date"],
  providersCount: number
): ChartEntry {
  const [a, b, c, d] = [...new Array(4)]
    .reduce<number[]>((result, _, index, input) => {
      const sum = result.reduce((sum, i) => sum + i, 0);
      const item =
        index === input.length - 1 ? 1 - sum : Math.random() * (1 - sum);
      return [...result, item];
    }, [])
    .map((i) => Math.round(i * providersCount));

  return {
    date,
    a,
    b,
    c,
    d,
  };
}

export function SLAPerformanceWidget(props: SLAPerformanceWidgetProps) {
  const formatXAxisTick = useCallback((value: unknown, index: number) => {
    if (typeof value !== "string" && typeof value !== "number") {
      return String(value);
    }

    const date = new Date(value);
    const previousEntry = chartData[index - 1];
    return !!previousEntry && isSameMonth(date, previousEntry.date)
      ? date.getDate().toString()
      : `${date.getDate()} ${dateMonthFormatter.format(date)}`;
  }, []);

  const formatDate = useCallback((value: unknown) => {
    if (typeof value !== "string") {
      return String(value);
    }

    const date = new Date(value);
    return isValidDate(date) ? dateFormatter.format(date) : String(date);
  }, []);

  return (
    <Card {...props}>
      <header className="px-4 pt-6 mb-4">
        <h3 className="text-lg font-medium">SLA Performance</h3>
        <p className="text-xs text-muted-foreground">
          Chart showing Storage Providers meeting SLAs over time
        </p>
      </header>

      <div>
        <ResponsiveContainer width="100%" height={300} debounce={50}>
          <BarChart
            data={chartData}
            maxBarSize={24}
            margin={{
              left: 16,
              right: 16,
              top: 16,
            }}
          >
            <XAxis
              dataKey="date"
              fontSize={12}
              tickFormatter={formatXAxisTick}
            />
            <YAxis width="auto" fontSize={12} />
            <Tooltip content={ChartTooltip} labelFormatter={formatDate} />
            <Bar dataKey="a" stackId="providers" name="Group 1" fill="green" />
            <Bar
              dataKey="b"
              stackId="providers"
              name="Group 2"
              fill="var(--chart-4)"
            />
            <Bar
              dataKey="c"
              stackId="providers"
              name="Group 3"
              fill="var(--chart-5)"
            />
            <Bar
              dataKey="d"
              stackId="providers"
              name="Group 4"
              fill="var(--chart-1)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
