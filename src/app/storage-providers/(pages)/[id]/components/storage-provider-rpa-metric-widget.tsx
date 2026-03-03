"use client";

import {
  fetchStorageProviderRpaMetricHistogram,
  type FetchStorageProviderRpaMetricHistogramParameters,
} from "@/app/storage-providers/storage-providers-data";
import { ChartStat } from "@/components/chart-stat";
import { ChartTooltip } from "@/components/chart-tooltip";
import { OverlayLoader } from "@/components/overlay-loader";
import { RetrievabilityChartExplanation } from "@/components/retrivability-chart-explanation";
import { Card } from "@/components/ui/card";
import { ChartLoader } from "@/components/ui/chart-loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { weekFromDate, weekToReadableString } from "@/lib/weeks";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useSWR from "swr";

type CardProps = ComponentProps<typeof Card>;
type ChartType = "rpa" | "bandwidth" | "ttfb";
type MetricType =
  FetchStorageProviderRpaMetricHistogramParameters["metricType"];
export interface StorageProviderRPAMetricWidgetProps
  extends Omit<CardProps, "children"> {
  animationDuration?: number;
  chartType: ChartType;
  provider: string;
}

const numericFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});
const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

export function StorageProviderRPAMetricWidget({
  animationDuration = 200,
  chartType,
  provider,
  ...rest
}: StorageProviderRPAMetricWidgetProps) {
  const [rpaMetricType, setRpaMetricType] = useState("RPA_RETRIEVABILITY");

  const metricType = useMemo<MetricType>(() => {
    switch (chartType) {
      case "bandwidth":
        return "BANDWIDTH";
      case "ttfb":
        return "TTFB";
      case "rpa":
        return rpaMetricType as MetricType;
    }
  }, [chartType, rpaMetricType]);

  const { data, error, isLoading, mutate } = useSWR(
    [QueryKey.STORAGE_PROVIDER_RPA_METRIC_HISTOGRAM, { provider, metricType }],
    ([, fetchParameters]) => {
      return fetchStorageProviderRpaMetricHistogram(fetchParameters);
    },
    {
      keepPreviousData: true,
      revalidateOnMount: false,
    }
  );

  const unit = data?.metadata.metricUnit;
  const isLongLoading = useDelayedFlag(!!data && isLoading, 500);

  const formatDate = useCallback((value: unknown) => {
    if (typeof value !== "string") {
      return String(value);
    }

    return weekToReadableString(weekFromDate(value));
  }, []);

  const formatValue = useCallback(
    (value: unknown) => {
      if (typeof value !== "number") {
        return String(value);
      }

      return unit === "%"
        ? percentageFormatter.format(value)
        : numericFormatter.format(value) + ` ${unit}`;
    },
    [unit]
  );

  const [latestValue, percentageChange] = useMemo<
    [string | undefined, number | undefined]
  >(() => {
    if (!data) {
      return [undefined, undefined];
    }

    if (data.results.length === 0) {
      return ["N/A", undefined];
    }

    if (data.results.length === 1) {
      return [formatValue(data.results[0].value), undefined];
    }

    const [previousValue, currentValue] = data.results
      .slice(-2)
      .map((result) => result.value);

    return [
      formatValue(currentValue),
      previousValue !== 0 ? currentValue / previousValue - 1 : undefined,
    ];
  }, [data, formatValue]);

  useEffect(() => {
    if (!data && !error && !isLoading) {
      mutate();
    }
  }, [data, error, isLoading, mutate]);

  return (
    <Card {...rest}>
      <header className="p-4 pb-2 flex flex-wrap items-center justify-between">
        {!!data ? (
          <h3 className="text-lg font-medium capitalize">
            {chartType === "rpa"
              ? "Retrievability"
              : data.metadata.metricDescription}
          </h3>
        ) : (
          <Skeleton className="w-[200px] h-[18px] my-[5px]" />
        )}

        {chartType === "rpa" && (
          <Select value={rpaMetricType} onValueChange={setRpaMetricType}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Retrievability Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RPA_RETRIEVABILITY">Default RPA</SelectItem>
              <SelectItem value="CONSISTENT_RETRIEVABILITY">
                Consistent
              </SelectItem>
              <SelectItem value="INCONSISTENT_RETRIEVABILITY">
                Inconsistent
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </header>

      <div className="px-4 mb-4">
        <ChartStat
          label="Latest Week Average"
          value={latestValue}
          percentageChange={percentageChange}
        />
      </div>

      <div className="relative h-[400px] flex flex-col items-center justify-center">
        {!isLoading && !!error && (
          <p className="text-sm text-muted-foreground text-center">
            An error occured while loading chart data. Please try again later.
          </p>
        )}

        {isLoading && !data && <ChartLoader />}

        {!error && !!data && data.results.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data.results}
              margin={{
                left: 16,
                right: 24,
                top: 16,
                bottom: 84,
              }}
            >
              <XAxis
                dataKey="date"
                fontSize={12}
                tickFormatter={formatDate}
                tick={{ textAnchor: "start" }}
                angle={90}
                padding={{ left: 24, right: 24 }}
              />
              <YAxis width="auto" fontSize={12} tickFormatter={formatValue} />
              <Tooltip
                content={ChartTooltip}
                labelFormatter={formatDate}
                formatter={formatValue}
              />
              <Line
                type="stepBefore"
                dataKey="value"
                name={
                  chartType === "rpa" ? "RPA" : data.metadata.metricDescription
                }
                animationDuration={animationDuration}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {!error && !!data && data.results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Nothing to show.
          </p>
        )}

        <OverlayLoader show={isLongLoading} />
      </div>

      {chartType === "rpa" && <RetrievabilityChartExplanation />}
    </Card>
  );
}
