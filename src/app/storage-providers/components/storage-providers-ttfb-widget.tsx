"use client";

import { ChartTooltip } from "@/components/chart-tooltip";
import {
  ChartType,
  ChartTypeTabsSelect,
} from "@/components/chart-type-tabs-select";
import { OverlayLoader } from "@/components/overlay-loader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import {
  ArrayElement,
  bigintToPercentage,
  cn,
  gradientPalette,
} from "@/lib/utils";
import { weekFromDate, weekToReadableString } from "@/lib/weeks";
import { filesize } from "filesize";
import { uniqBy } from "lodash";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
import {
  Area,
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useSWR from "swr";
import {
  fetchRpaMetricHistogram,
  type FetchRPAMetricHistogramParameters,
} from "../storage-providers-data";

type CardProps = ComponentProps<typeof Card>;

interface StorageProvidersTTFBWidgetProps extends CardProps {
  animationDuration?: number;
}

type GroupKey = `group_${number}`;
type GroupValues = Record<GroupKey, number>;
type ChartDataEntry = GroupValues & {
  date: string;
};

/**
 * Lower value exclusive. Upper inclusive.
 */
type Range = [number, number];
type EnabledChartType = ArrayElement<typeof enabledChartTypes>;

const scales = ["linear", "percentage", "log"] as const;
const modes = ["datacap", "count"] as const;
const enabledChartTypes = ["area", "bar"] as const satisfies ChartType[];

const scalesLabelDict: Record<ArrayElement<typeof scales>, string> = {
  linear: "Linear",
  percentage: "Percentage",
  log: "Log",
};

const modesLabelDict: Record<ArrayElement<typeof modes>, string> = {
  datacap: "PiB",
  count: "Count",
};

function indexToGroupKey(index: number): GroupKey {
  return `group_${index}`;
}

function getLabelForRange(range: Range): string {
  const [lowerBound, upperBound] = range;

  if (lowerBound === null && upperBound === null) {
    return "";
  }

  if (lowerBound === null) {
    return upperBound === 0 ? "0ms" : `Less than ${upperBound}ms`;
  }

  if (upperBound === null) {
    return `Over ${lowerBound}ms`;
  }

  return `${lowerBound}ms - ${upperBound}ms`;
}

const fetchParameters: FetchRPAMetricHistogramParameters = {
  metricType: "TTFB",
};

export function StorageProvidersTTFBWidget({
  animationDuration = 500,
  className,
  ...rest
}: StorageProvidersTTFBWidgetProps) {
  const [scale, setScale] = useState<string>(scales[0]);
  const [mode, setMode] = useState<string>(modes[0]);
  const [chartType, setChartType] = useState<EnabledChartType>("bar");

  const { data, isLoading } = useSWR(
    [QueryKey.RPA_METRIC_HISTOGRAM, fetchParameters],
    ([, fetchParameters]) => fetchRpaMetricHistogram(fetchParameters),
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const [ranges, chartData] = useMemo<[Range[], ChartDataEntry[]]>(() => {
    if (!data || data.results.length === 0) {
      return [[], []];
    }

    const allRanges = data.results.flatMap((result) => {
      return result.results.map<Range>((result) => [
        result.valueFromExclusive,
        result.valueToInclusive,
      ]);
    });

    const ranges = uniqBy(allRanges, ([lower, upper]) => {
      return `${lower}-${upper}`;
    }).sort(([lowerBoundA], [lowerBoundB]) => {
      return lowerBoundA - lowerBoundB;
    });

    const chartData = data.results.map<ChartDataEntry>((histogramEntry) => {
      const totalValue =
        scale === "percentage"
          ? histogramEntry.results.reduce((sum, week) => {
              return (
                sum +
                BigInt(mode === "datacap" ? week.totalDatacap : week.count)
              );
            }, 0n)
          : 1n;

      const groupValues = ranges.reduce<GroupValues>(
        (result, range, rangeIndex) => {
          const [lowerBoundExclusive, upperBoundInclusive] = range;
          const resultValue = histogramEntry.results
            .filter((bucket) => {
              const matchesLowerBound =
                lowerBoundExclusive === null ||
                bucket.valueFromExclusive >= lowerBoundExclusive;
              const matchesUpperBound =
                upperBoundInclusive === null ||
                bucket.valueToInclusive <= upperBoundInclusive;
              return matchesLowerBound && matchesUpperBound;
            })
            .reduce((sum, bucket) => {
              return (
                sum +
                BigInt(mode === "datacap" ? bucket.totalDatacap : bucket.count)
              );
            }, 0n);

          return {
            ...result,
            [indexToGroupKey(rangeIndex)]:
              scale === "percentage"
                ? bigintToPercentage(resultValue, totalValue)
                : Number(resultValue),
          };
        },
        {}
      );

      return {
        date: histogramEntry.week,
        ...groupValues,
      };
    });

    return [ranges, chartData];
  }, [data, mode, scale]);

  const palette = useMemo(() => {
    return gradientPalette("#4CAF50", "#FF5722", ranges.length);
  }, [ranges.length]);

  const yAxisLabel = useMemo(() => {
    const prefix = mode === "datacap" ? "Datacap" : "SP Count";
    const suffix = scale === "percentage" ? " Percentage" : "";

    return prefix + suffix;
  }, [mode, scale]);

  const formatDate = useCallback((value: unknown) => {
    if (typeof value !== "string") {
      return String(value);
    }

    return weekToReadableString(weekFromDate(value));
  }, []);

  const formatValue = useCallback(
    (value: string | number) => {
      if (scale === "percentage") {
        return (
          parseFloat(
            typeof value === "string" ? value : value.toFixed(2)
          ).toString() + "%"
        );
      }

      if (mode === "datacap") {
        return filesize(value, { standard: "iec" });
      }

      return String(value);
    },
    [mode, scale]
  );

  return (
    <Card {...rest} className={cn("pb-4", className)}>
      <header className="px-4 py-4 max-w-[min(50vw, 200px)]">
        <h3 className="text-lg font-medium">Time to First Byte Histogram</h3>
        <p className="text-xs text-muted-foreground">
          Storage Providers and their Datacap grouped by their TTFB measurment.
        </p>
      </header>

      <div className="px-4 mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList>
              {modes.map((possibleMode) => (
                <TabsTrigger key={possibleMode} value={possibleMode}>
                  {modesLabelDict[possibleMode]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Tabs value={scale} onValueChange={setScale}>
            <TabsList>
              {scales.map((possibleScale) => (
                <TabsTrigger key={possibleScale} value={possibleScale}>
                  {scalesLabelDict[possibleScale]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <ChartTypeTabsSelect
            chartType={chartType}
            enable={enabledChartTypes}
            onChartTypeChange={setChartType}
          />
        </div>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={454} debounce={200}>
          <ComposedChart
            data={chartData}
            margin={{
              left: 24,
              right: 16,
              bottom: 64,
              top: 32,
            }}
            barGap={0}
            barCategoryGap={0}
          >
            <XAxis
              dataKey="date"
              fontSize={12}
              tickFormatter={formatDate}
              tick={{
                textAnchor: "start",
              }}
              angle={90}
            />
            <YAxis
              fontSize={14}
              tickFormatter={formatValue}
              scale={scale === "log" ? "symlog" : "linear"}
              label={{
                value: yAxisLabel,
                position: "insideLeft",
                angle: -90,
                fontSize: 14,
                offset: -12,
                style: {
                  textAnchor: "middle",
                },
              }}
            />

            <Tooltip
              labelFormatter={formatDate}
              formatter={formatValue}
              content={ChartTooltip}
            />

            {ranges.map((range, rangeIndex) => {
              const dataKey = indexToGroupKey(rangeIndex);
              const name = getLabelForRange(range);

              switch (chartType) {
                case "area":
                  return (
                    <Area
                      key={`area_${rangeIndex}`}
                      dataKey={dataKey}
                      stackId="areas"
                      type="monotone"
                      name={name}
                      fill={palette[rangeIndex]}
                      stroke={palette[rangeIndex]}
                      animationDuration={animationDuration}
                    />
                  );
                case "bar":
                  return (
                    <Bar
                      key={`bar_${rangeIndex}`}
                      dataKey={dataKey}
                      stackId="bars"
                      name={name}
                      fill={palette[rangeIndex]}
                      animationDuration={animationDuration}
                    />
                  );
              }
            })}
          </ComposedChart>
        </ResponsiveContainer>
        {<OverlayLoader show={!data || isLongLoading} />}
      </div>
    </Card>
  );
}
