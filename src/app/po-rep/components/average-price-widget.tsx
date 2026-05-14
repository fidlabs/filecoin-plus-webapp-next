"use client";

import { ChartStat } from "@/components/chart-stat";
import { ChartTooltip } from "@/components/chart-tooltip";
import { Card } from "@/components/ui/card";
import { isSameMonth, isValidDate } from "@/lib/utils";
import { startOfDay, sub } from "date-fns";
import { useCallback, useMemo, type ComponentProps } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CardProps = ComponentProps<typeof Card>;
export type AveragePriceWidgetProps = Omit<CardProps, "children">;

interface ChartEntry {
  date: string;
  price: number;
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

  return {
    date,
    price: 2,
  };
});

// TODO: propably get it from backend
const unit = "USDFC";

export function AveragePriceWidget(props: AveragePriceWidgetProps) {
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
    return String(value) + ` ${unit}`;
  }, []);

  const [currentPrice, priceChange] = useMemo<
    [string, number | undefined]
  >(() => {
    const currentEntry = chartData.at(-1);

    if (!currentEntry) {
      return ["N/A", undefined];
    }

    const previousEntry = chartData.at(-2);

    if (!previousEntry) {
      return [formatValue(currentEntry.price), undefined];
    }

    const change =
      previousEntry.price === 0
        ? undefined
        : currentEntry.price / previousEntry.price - 1;

    return [formatValue(currentEntry.price), change];
  }, [formatValue]);

  return (
    <Card {...props}>
      <header className="px-4 pt-6 mb-2">
        <h3 className="text-lg font-medium">Average Price per TiB</h3>
        <p className="text-xs text-muted-foreground">
          Average cost of storing 1 TiB of data through the PoRep market over
          time
        </p>
      </header>

      <div className="px-4 mb-6">
        <ChartStat
          label="Current Average Price"
          value={currentPrice}
          percentageChange={priceChange}
        />
      </div>

      <div>
        <ResponsiveContainer width="100%" height={300} debounce={50}>
          <LineChart
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
            <Tooltip
              content={ChartTooltip}
              labelFormatter={formatDate}
              formatter={formatValue}
            />
            <Line
              dataKey="price"
              name="Average Price per TiB"
              fill="var(--color-dodger-blue)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
