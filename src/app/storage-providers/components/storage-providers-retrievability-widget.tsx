"use client";

import { ChartStat } from "@/components/chart-stat";
import {
  ChartTooltipContainer,
  ChartTooltipGrid,
  ChartTooltipHeader,
  ChartTooltipTitle,
} from "@/components/chart-tooltip";
import { OverlayLoader } from "@/components/overlay-loader";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import useSWR from "swr";
import {
  fetchStorageProvidersRetrievabilityData,
  FetchStorageProvidersRetrievabilityDataParameters,
} from "../storage-providers-data";
import {
  ChartType,
  ChartTypeTabsSelect,
} from "@/components/chart-type-tabs-select";
import { useDynamicBarsCount } from "@/lib/hooks/use-dynamic-bars-count";

type CardProps = ComponentProps<typeof Card>;
type CheckboxProps = ComponentProps<typeof Checkbox>;
type CheckedChangeHandler = NonNullable<CheckboxProps["onCheckedChange"]>;

interface StorageProvidersRetrievabilityWidgetProps extends CardProps {
  animationDuration?: number;
}

type GroupKey = `group_${number}`;
type GroupValues = Record<GroupKey, number>;
type ChartDataEntry = GroupValues & {
  date: string;
  averageSuccessRate: number | null;
};

/**
 * Lower value exclusive. Upper inclusive.
 */
type Range = [number | null, number | null];
type RetrievabilityType = NonNullable<
  FetchStorageProvidersRetrievabilityDataParameters["retrievabilityType"]
>;
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

export function StorageProvidersRetrievabilityWidget({
  animationDuration = 500,
  className,
  ...rest
}: StorageProvidersRetrievabilityWidgetProps) {
  const [editionId, setEditionId] = useState<string>();
  const [retrievabilityType, setRetrievabilityType] =
    useState<RetrievabilityType>("urlFinder");
  const [openDataOnly, setOpenDataOnly] = useState(false);
  const [scale, setScale] = useState<string>(scales[0]);
  const [mode, setMode] = useState<string>(modes[0]);
  const [groupingOption, setGroupingOption] = useState<string>(
    groupingOptions[0]
  );
  const [chartType, setChartType] = useState<EnabledChartType>("area");
  const { chartWrapperRef, barsCount } = useDynamicBarsCount({
    minBarSize: 12,
    margins: 160,
  });

  const parameters: FetchStorageProvidersRetrievabilityDataParameters = {
    editionId,
    openDataOnly,
    retrievabilityType,
  };

  const { data, isLoading } = useSWR(
    [QueryKey.STORAGE_PROVIDERS_RETRIEVABILITY_DATA, parameters],
    ([, fetchParameters]) =>
      fetchStorageProvidersRetrievabilityData(fetchParameters),
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const { weeklyAverage, weeklyAveragePercentageChange } = useMemo(() => {
    if (!data) {
      return {
        weeklyAverage: null,
        weeklyAveragePercentageChange: undefined,
      };
    }

    const [previousWeekData, currentWeekData] =
      data.histogram.results.slice(-2) ?? [];

    if (!currentWeekData) {
      return {
        weeklyAverage: "N/A",
        weeklyAveragePercentageChange: undefined,
      };
    }

    const currentWeekAverage =
      retrievabilityType === "http"
        ? currentWeekData.averageHttpSuccessRate
        : currentWeekData.averageUrlFinderSuccessRate;
    const previousWeekAverage =
      retrievabilityType === "http"
        ? previousWeekData.averageHttpSuccessRate
        : previousWeekData.averageUrlFinderSuccessRate;

    const weeklyAveragePercentageChange =
      typeof currentWeekAverage === "number" &&
      typeof previousWeekAverage === "number" &&
      previousWeekAverage !== 0
        ? currentWeekAverage / previousWeekAverage - 1
        : undefined;

    return {
      weeklyAverage: currentWeekAverage
        ? percentageFormatter.format(currentWeekAverage / 100)
        : "N/A",
      weeklyAveragePercentageChange,
    };
  }, [data, retrievabilityType]);

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

    const chartData = data.histogram.results.map<ChartDataEntry>(
      (histogramEntry) => {
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
                  BigInt(
                    mode === "datacap" ? bucket.totalDatacap : bucket.count
                  )
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

        const averageSuccessRate =
          retrievabilityType === "http"
            ? histogramEntry.averageHttpSuccessRate
            : histogramEntry.averageUrlFinderSuccessRate;

        return {
          date: histogramEntry.week,
          averageSuccessRate: averageSuccessRate ?? null,
          ...groupValues,
        };
      }
    );

    return [ranges, chartData];
  }, [data, groupingOption, mode, retrievabilityType, scale]);

  const palette = useMemo(() => {
    return gradientPalette("#FF5722", "#4CAF50", ranges.length);
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

  const handleRetrievabilityTypeChange = useCallback((value: string) => {
    setRetrievabilityType(value === "urlFinder" ? "urlFinder" : "http");
  }, []);

  const handleOpenDataToggleChange = useCallback<CheckedChangeHandler>(
    (state) => {
      if (state !== "indeterminate") {
        setOpenDataOnly(state);
      }
    },
    []
  );

  return (
    <Card {...rest} className={cn("pb-4", className)}>
      <header className="px-4 py-4 max-w-[min(50vw, 200px)]">
        <h3 className="text-lg font-medium">Retrievability Score</h3>
        <p className="text-xs text-muted-foreground">
          Storage Providers and their datacap grouped by their retrievability
          score.
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

          <Tabs
            value={retrievabilityType}
            onValueChange={handleRetrievabilityTypeChange}
          >
            <TabsList>
              <TabsTrigger value="urlFinder">RPA</TabsTrigger>
              <TabsTrigger value="http">HTTP</TabsTrigger>
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="open-data"
              checked={openDataOnly}
              onCheckedChange={handleOpenDataToggleChange}
            />
            <label
              className="text-sm font-medium leading-none cursor-pointer"
              htmlFor="open-data"
            >
              Open Data Only
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8">
          <ChartStat
            label="Weekly Average"
            value={weeklyAverage}
            percentageChange={weeklyAveragePercentageChange}
          />
        </div>
      </div>

      <div className="relative">
        <ResponsiveContainer
          ref={chartWrapperRef}
          width="100%"
          height={454}
          debounce={200}
        >
          <ComposedChart
            data={chartType === "bar" ? chartData.slice(-barsCount) : chartData}
            margin={{
              left: 24,
              right: 16,
              bottom: 84,
              top: 32,
            }}
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
              yAxisId="sp"
              fontSize={14}
              tickFormatter={formatValue}
              scale={scale === "log" ? "symlog" : "linear"}
              label={{
                value: mode === "datacap" ? "Datacap" : "SP count",
                position: "insideLeft",
                angle: -90,
                fontSize: 14,
                offset: -12,
                style: {
                  textAnchor: "middle",
                },
              }}
            />
            <YAxis
              yAxisId="average"
              orientation="right"
              fontSize={14}
              label={{
                value: "Average Success Rate (%)",
                position: "insideRight",
                angle: 90,
                fontSize: 14,
                style: {
                  textAnchor: "middle",
                },
              }}
            />

            <Tooltip
              labelFormatter={formatDate}
              formatter={formatTooltipValue}
              content={CustomTooltipContent}
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
                      yAxisId="sp"
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
                      yAxisId="sp"
                      stackId="bars"
                      name={name}
                      fill={palette[rangeIndex]}
                      stroke="#000"
                      strokeWidth={1}
                      animationDuration={animationDuration}
                    />
                  );
              }
            })}

            <Line
              yAxisId="average"
              dataKey="averageSuccessRate"
              name="Average Success Rate"
              stroke="rgba(0, 0, 0, 0.5)"
              animationDuration={animationDuration}
            />
          </ComposedChart>
        </ResponsiveContainer>
        {<OverlayLoader show={!data || isLongLoading} />}
      </div>
    </Card>
  );
}

function CustomTooltipContent(
  props: TooltipContentProps<number | string, string>
) {
  if (!props.payload || props.payload.length === 0) {
    return null;
  }

  const labelText = props.labelFormatter
    ? props.labelFormatter(props.label, props.payload ?? [])
    : props.label;

  const averagePayloadIndex = props.payload.findIndex(
    (payload) => payload.dataKey === "averageSuccessRate"
  );
  const averagePayload =
    averagePayloadIndex === -1 ? null : props.payload[averagePayloadIndex];

  const groupsPayloads =
    averagePayloadIndex === -1
      ? props.payload
      : props.payload.toSpliced(averagePayloadIndex, 1);

  return (
    <ChartTooltipContainer>
      <ChartTooltipHeader>
        <ChartTooltipTitle>{labelText}</ChartTooltipTitle>

        {!!averagePayload && typeof averagePayload.value === "number" && (
          <p className="text-sm">
            {averagePayload.name}:{" "}
            <strong className="font-semibold">
              {props.formatter
                ? props.formatter(
                    averagePayload.value,
                    averagePayload.name ?? "",
                    averagePayload,
                    averagePayloadIndex,
                    props.payload ?? []
                  )
                : averagePayload.value}
            </strong>
          </p>
        )}
      </ChartTooltipHeader>

      <ChartTooltipGrid payload={groupsPayloads} formatter={props.formatter} />
    </ChartTooltipContainer>
  );
}
