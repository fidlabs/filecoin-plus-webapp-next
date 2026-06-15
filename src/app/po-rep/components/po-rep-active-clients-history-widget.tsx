"use client";

import { ChartStat } from "@/components/chart-stat";
import { ChartTooltip } from "@/components/chart-tooltip";
import { OverlayLoader } from "@/components/overlay-loader";
import { Card } from "@/components/ui/card";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { isSameMonth, isValidDate } from "@/lib/utils";
import { weekFromDate, weekToReadableString } from "@/lib/weeks";
import { UTCDate } from "@date-fns/utc";
import { useCallback, useMemo, useState, type ComponentProps } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useSWR from "swr";
import {
  fetchPoRepActiveClientsHistory,
  FetchPoRepActiveClientsHistoryParameters,
} from "../po-rep-data";
import {
  HistoricalChartWindowSizeSelect,
  HistoricalChartWindowSizeSelectProps,
} from "./historical-chart-window-size-select";

type WindowSize = HistoricalChartWindowSizeSelectProps["windowSize"];
type CardProps = ComponentProps<typeof Card>;
export type PoRepActiveClientsHistoryWidgetProps = Omit<CardProps, "children">;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function PoRepActiveClientsHistoryWidget(
  props: PoRepActiveClientsHistoryWidgetProps
) {
  const [windowSize, setWindowSize] = useState<WindowSize>("day");
  const parameters: FetchPoRepActiveClientsHistoryParameters = {
    windowSize,
  };
  const { data, error, isLoading } = useSWR(
    [QueryKey.PO_REP_ACTIVE_CLIENTS_HISTORY, parameters],
    ([, fetchParameters]) => {
      return fetchPoRepActiveClientsHistory(fetchParameters);
    },
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const chartData = useMemo(() => {
    return data ?? [];
  }, [data]);

  const maxValue = useMemo(() => {
    return chartData.reduce((max, i) => Math.max(max, i.activeClientsCount), 0);
  }, [chartData]);

  const formatXAxisTick = useCallback(
    (value: string) => {
      const date = new UTCDate(value);

      if (!isValidDate(date)) {
        return value;
      }

      if (windowSize === "month") {
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }).format(date);
      }

      if (windowSize === "week") {
        return weekToReadableString(weekFromDate(date));
      }

      const currentIndex = data?.findIndex((i) => i.date === value);
      const previousDateString =
        currentIndex !== undefined && currentIndex > 0
          ? data?.at(currentIndex - 1)?.date
          : undefined;
      const previousDate = previousDateString
        ? new UTCDate(previousDateString)
        : undefined;

      if (
        !previousDate ||
        !isValidDate(previousDate) ||
        !isSameMonth(date, previousDate)
      ) {
        return new Intl.DateTimeFormat("en-US", {
          day: "numeric",
          month: "short",
        }).format(date);
      }

      return date.getDate().toString();
    },
    [data, windowSize]
  );

  const formatDate = useCallback((value: unknown) => {
    if (typeof value !== "string") {
      return String(value);
    }

    const date = new Date(value);
    return isValidDate(date) ? dateFormatter.format(date) : String(date);
  }, []);

  const [activeClientsCount, activeClientsChange] = useMemo<
    [string, number | undefined]
  >(() => {
    const currentEntry = chartData.at(-1);

    if (!currentEntry) {
      return ["N/A", undefined];
    }

    const previousEntry = chartData.at(-2);

    if (!previousEntry) {
      return [String(currentEntry.activeClientsCount), undefined];
    }

    const change =
      previousEntry.activeClientsCount === 0
        ? undefined
        : currentEntry.activeClientsCount / previousEntry.activeClientsCount -
          1;

    return [String(currentEntry.activeClientsCount), change];
  }, [chartData]);

  return (
    <Card {...props}>
      <header className="px-4 pt-6 mb-4 flex flex-wrap gap-2 justify-between">
        <div>
          <h3 className="text-lg font-medium">Active Clients</h3>
          <p className="text-xs text-muted-foreground">
            Average cost of storing 1 TiB of data through the PoRep market over
            time
          </p>
        </div>

        <HistoricalChartWindowSizeSelect
          windowSize={windowSize}
          onWindowSizeChange={setWindowSize}
        />
      </header>

      <div className="px-4 mb-6">
        <ChartStat
          label="Active Clients Count"
          value={activeClientsCount}
          percentageChange={activeClientsChange}
        />
      </div>

      <div className="relative px-4">
        {!!error && (
          <p className="text-sm text-muted-foreground text-center mb-6">
            An error has occured while loading the data. Please try again later.
          </p>
        )}

        {!error && (
          <ResponsiveContainer width="100%" height={300} debounce={50}>
            <LineChart
              data={chartData}
              maxBarSize={24}
              margin={{
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
                fontSize={12}
                domain={[0, maxValue]}
                ticks={[0, activeClientsCount, maxValue]}
              />
              <Tooltip content={ChartTooltip} labelFormatter={formatDate} />
              <Line
                dataKey="activeClientsCount"
                name="Active Clients Count"
                fill="var(--color-dodger-blue)"
                dot={false}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        <OverlayLoader show={isLongLoading} />
      </div>
    </Card>
  );
}
