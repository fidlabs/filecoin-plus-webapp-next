"use client";

import { ChartStat } from "@/components/chart-stat";
import { ChartTooltip } from "@/components/chart-tooltip";
import { Card } from "@/components/ui/card";
import { isSameMonth, isValidDate } from "@/lib/utils";
import { startOfDay, sub } from "date-fns";
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
export type PoRepMoneyFlowWidgetProps = Omit<CardProps, "children">;

interface ChartEntry {
  date: string;
  received: number;
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

const numericFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  notation: "compact",
});

const unit = "USDFC";

const chartData = [...new Array(20)].reduce<ChartEntry[]>(
  (result, _, index, array) => {
    const date = startOfDay(
      sub(new Date(), { days: array.length - index })
    ).toISOString();

    const received = Math.round(Math.random() * 1000);
    const total = index !== 0 ? result[index - 1].total : 0;

    return [
      ...result,
      {
        date,
        received,
        total: total + received,
      },
    ];
  },
  []
);

export function PoRepMoneyFlowWidget(props: PoRepMoneyFlowWidgetProps) {
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

  const formatTick = useCallback((value: string | number) => {
    if (typeof value === "number") {
      return numericFormatter.format(value);
    }

    return String(value);
  }, []);

  const formatValue = useCallback((value: string | number) => {
    if (typeof value === "number") {
      return numericFormatter.format(value) + ` ${unit}`;
    }

    return String(value);
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
        <h3 className="text-lg font-medium">Money Flow</h3>
        <p className="text-xs text-muted-foreground">
          Total amount of money that has flown to the SPs through the allocator
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
              tickFormatter={formatTick}
              label={{
                value: "Total",
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
              yAxisId="received"
              orientation="right"
              fontSize={12}
              tickFormatter={formatTick}
              label={{
                value: "Received",
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
              name="Total"
              fill="var(--chart-2)"
              stroke="var(--chart-2)"
            />

            <Bar
              dataKey="received"
              yAxisId="received"
              name="Received"
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
