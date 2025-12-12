"use client";

import { ChartTooltip } from "@/components/chart-tooltip";
import {
  ChartType,
  ChartTypeTabsSelect,
} from "@/components/chart-type-tabs-select";
import { OverlayLoader } from "@/components/overlay-loader";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { useDynamicBarsCount } from "@/lib/hooks/use-dynamic-bars-count";
import {
  ArrayElement,
  bigintToPercentage,
  cn,
  gradientPalette,
} from "@/lib/utils";
import { weekFromDate, weekToReadableString } from "@/lib/weeks";
import { filesize } from "filesize";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useSWR from "swr";
import {
  fetchStorageProvidersClientDistributionData,
  FetchStorageProvidersClientDistributionDataParameters,
} from "../storage-providers-data";

type CardProps = ComponentProps<typeof Card>;

interface StorageProvidersClientDistributionWidgetProps extends CardProps {
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
type Range = [number | null, number | null];
type EnabledChartType = ArrayElement<typeof enabledChartTypes>;

const scales = ["linear", "percentage", "log"] as const;
const modes = ["datacap", "count"] as const;
const groupingOptions = ["three", "six", "all"] as const;
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

const groupingOptionsLabelDict: Record<
  ArrayElement<typeof groupingOptions>,
  string
> = {
  three: "3 Groups",
  six: "6 Groups",
  all: "All",
};

const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

const threeGroupsRanges: Range[] = [
  [null, 30],
  [30, 65],
  [65, null],
];

const sixGroupsRanges: Range[] = [
  [null, 15],
  [15, 35],
  [35, 55],
  [55, 75],
  [75, 95],
  [95, null],
];

const allRanges = [...Array(21)].map<Range>((_, index) => {
  return [index === 0 ? null : 5 * (index - 1), 5 * index];
});

function indexToGroupKey(index: number): GroupKey {
  return `group_${index}`;
}

function getLabelForRange(range: Range): string {
  const [lowerBound, upperBound] = range;

  if (lowerBound === null && upperBound === null) {
    return "";
  }

  if (lowerBound === null) {
    return upperBound === 0 ? "0%" : `Less than ${upperBound}%`;
  }

  if (upperBound === null) {
    return `Over ${lowerBound}%`;
  }

  return `${lowerBound}% - ${upperBound}%`;
}

export function StorageProvidersClientDistributionWidget({
  animationDuration = 500,
  className,
  ...rest
}: StorageProvidersClientDistributionWidgetProps) {
  const [editionId, setEditionId] = useState<string>();
  const [scale, setScale] = useState<string>(scales[0]);
  const [mode, setMode] = useState<string>(modes[0]);
  const [groupingOption, setGroupingOption] = useState<string>(
    groupingOptions[0]
  );
  const [chartType, setChartType] = useState<EnabledChartType>("area");
  const { chartWrapperRef, barsCount } = useDynamicBarsCount({
    minBarSize: 12,
    margins: 116,
  });

  const parameters: FetchStorageProvidersClientDistributionDataParameters = {
    editionId,
  };

  const { data, isLoading } = useSWR(
    [QueryKey.STORAGE_PROVIDERS_CLIENT_DISTRIBUTION_DATA, parameters],
    ([, fetchParameters]) =>
      fetchStorageProvidersClientDistributionData(fetchParameters),
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const [ranges, chartData] = useMemo<[Range[], ChartDataEntry[]]>(() => {
    if (!data) {
      return [[], []];
    }

    const ranges = (() => {
      switch (groupingOption) {
        case "three":
          return threeGroupsRanges;
        case "six":
          return sixGroupsRanges;
        default:
          return allRanges;
      }
    })();

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
        averageSuccessRate: histogramEntry.averageSuccessRate ?? null,
        ...groupValues,
      };
    });

    return [ranges, chartData];
  }, [data, groupingOption, mode, scale]);

  const palette = useMemo(() => {
    return gradientPalette("#4CAF50", "#FF5722", ranges.length);
  }, [ranges.length]);

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

  const formatTooltipValue = useCallback(
    (value: string | number, name: string) => {
      if (typeof value === "number" && name === "Average Success Rate") {
        return percentageFormatter.format(value / 100);
      }

      return formatValue(value);
    },
    [formatValue]
  );

  const handleEditionChange = useCallback((value: string) => {
    setEditionId(value === "all" ? undefined : value);
  }, []);

  return (
    <Card {...rest} className={cn("pb-4", className)}>
      <header className="px-4 py-4 max-w-[min(50vw, 200px)]">
        <h3 className="text-lg font-medium">
          Size of the Biggest Client Allocation
        </h3>
        <p className="text-xs text-muted-foreground">
          Percentage of the total Datacap used that comes from a single client
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

          <Tabs value={groupingOption} onValueChange={setGroupingOption}>
            <TabsList>
              {groupingOptions.map((possibleGroupingOption) => (
                <TabsTrigger
                  key={possibleGroupingOption}
                  value={possibleGroupingOption}
                >
                  {groupingOptionsLabelDict[possibleGroupingOption]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Select
            value={editionId ?? "all"}
            onValueChange={handleEditionChange}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Editions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Editions</SelectItem>
              <SelectItem value="5">Edition 5</SelectItem>
              <SelectItem value="6">Edition 6</SelectItem>
            </SelectContent>
          </Select>

          <ChartTypeTabsSelect
            chartType={chartType}
            enable={enabledChartTypes}
            onChartTypeChange={setChartType}
          />
        </div>
      </div>

      <div className="relative">
        <ResponsiveContainer
          ref={chartWrapperRef}
          width="100%"
          height={400}
          debounce={200}
        >
          <AreaChart
            data={chartType === "bar" ? chartData.slice(-barsCount) : chartData}
            margin={{
              left: 16,
              right: 16,
              bottom: 32,
              top: 32,
            }}
          >
            <XAxis
              dataKey="date"
              fontSize={12}
              tickFormatter={formatDate}
              angle={90}
              tickMargin={24}
            />
            <YAxis
              fontSize={14}
              tickFormatter={formatValue}
              scale={scale === "log" ? "symlog" : "linear"}
            />

            <Tooltip<string | number, string>
              labelFormatter={formatDate}
              formatter={formatTooltipValue}
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
                      name={name}
                      type="monotone"
                      stackId="areas"
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
                      name={name}
                      type="monotone"
                      stackId="bars"
                      fill={palette[rangeIndex]}
                      stroke="#000"
                      strokeWidth={1}
                      animationDuration={animationDuration}
                    />
                  );
              }
            })}
          </AreaChart>
        </ResponsiveContainer>
        {<OverlayLoader show={!data || isLongLoading} />}
      </div>
    </Card>
  );
}
