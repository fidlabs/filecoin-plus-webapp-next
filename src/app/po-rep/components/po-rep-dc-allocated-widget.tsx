"use client";

import { ChartStat } from "@/components/chart-stat";
import { ChartTooltip } from "@/components/chart-tooltip";
import { Card } from "@/components/ui/card";
import { isSameMonth, isValidDate } from "@/lib/utils";
import { startOfDay, sub } from "date-fns";
import { filesize } from "filesize";
import { useCallback, useMemo, type ComponentProps } from "react";
import {
  Area,
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CardProps = ComponentProps<typeof Card>;
export type PoRepDCAllocatedWidgetProps = Omit<CardProps, "children">;

interface ChartEntry {
  date: string;
  allocated: number;
  total: number;
}

const dateMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const onePiB = 1125899906842623;

const chartData = [...new Array(20)].reduce<ChartEntry[]>(
  (result, _, index, array) => {
    const date = startOfDay(
      sub(new Date(), { days: array.length - index })
    ).toISOString();

    const allocated = Math.round(Math.random() * onePiB);
    const total = index !== 0 ? result[index - 1].total : 0;

    return [
      ...result,
      {
        date,
        allocated,
        total: total + allocated,
      },
    ];
  },
  []
);

export function PoRepDCAllocatedWidget(props: PoRepDCAllocatedWidgetProps) {
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

  const formatValue = useCallback((value: string | number) => {
    return filesize(value, { standard: "iec" });
  }, []);

  const [currentTotal, totalChange] = useMemo<
    [string, number | undefined]
  >(() => {
    const currentEntry = chartData.at(-1);

    if (!currentEntry) {
      return ["N/A", undefined];
    }

    const previousEntry = chartData.at(-2);

    if (!previousEntry) {
      return [formatValue(currentEntry.total), undefined];
    }

    const change =
      previousEntry.total === 0
        ? undefined
        : currentEntry.total / previousEntry.total - 1;

    return [formatValue(currentEntry.total), change];
  }, [formatValue]);

  return (
    <Card {...props}>
      <header className="px-4 pt-6 mb-2">
        <h3 className="text-lg font-medium">DC Allocated</h3>
        <p className="text-xs text-muted-foreground">
          Amount of DC allocated by P2PP Allocator over time
        </p>
      </header>

      <div className="px-4 mb-6">
        <ChartStat
          label="Current Total"
          value={currentTotal}
          percentageChange={totalChange}
        />
      </div>

      <div>
        <ResponsiveContainer width="100%" height={300} debounce={50}>
          <ComposedChart
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
            <YAxis
              width="auto"
              yAxisId="total"
              fontSize={12}
              tickFormatter={formatValue}
              label={{
                value: "Total DC",
                position: "insideLeft",
                angle: -90,
                fontSize: 12,
                style: {
                  textAnchor: "middle",
                },
              }}
            />
            <YAxis
              width="auto"
              yAxisId="allocated"
              orientation="right"
              fontSize={12}
              tickFormatter={formatValue}
              label={{
                value: "DC Allocated",
                position: "insideRight",
                angle: 90,
                fontSize: 12,
                offset: 12,
                style: {
                  textAnchor: "middle",
                },
              }}
            />
            <Tooltip
              content={ChartTooltip}
              labelFormatter={formatDate}
              formatter={formatValue}
            />

            <Area
              dataKey="total"
              yAxisId="total"
              name="Total DC"
              fill="var(--chart-2)"
              stroke="var(--chart-2)"
            />

            <Bar
              dataKey="allocated"
              yAxisId="allocated"
              name="DC Allocated"
              fill="var(--chart-3)"
              stroke="#000"
              strokeWidth={1}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
