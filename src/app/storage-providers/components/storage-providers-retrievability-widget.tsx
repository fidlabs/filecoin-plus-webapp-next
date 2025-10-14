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
import { bigintToPercentage, cn, gradientPalette } from "@/lib/utils";
import { weekFromDate, weekToReadableString } from "@/lib/weeks";
import { scaleSymlog } from "d3-scale";
import { filesize } from "filesize";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import useSWR from "swr";
import {
  fetchStorageProvidersRetrievabilityData,
  FetchStorageProvidersRetrievabilityDataParameters,
} from "../storage-providers-data";

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

const scales = ["linear", "percentage", "log"] as const;
const modes = ["datacap", "count"] as const;
const groupingOptions = ["three", "six", "all"] as const;

const scalesLabelDict: Record<(typeof scales)[number], string> = {
  linear: "Linear",
  percentage: "Percentage",
  log: "Log",
};

const modesLabelDict: Record<(typeof modes)[number], string> = {
  datacap: "PiB",
  count: "Count",
};

const groupingOptionsLabelDict: Record<
  (typeof groupingOptions)[number],
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

  const { allTimeAverage, weeklyAverage, weeklyAveragePercentageChange } =
    useMemo(() => {
      if (!data) {
        return {
          allTimeAverage: null,
          weeklyAverage: null,
          weeklyAveragePercentageChange: undefined,
        };
      }

      const allTimeAverage = data.averageSuccessRate
        ? percentageFormatter.format(data.averageSuccessRate / 100)
        : "N/A";
      const [previousWeekData, currentWeekData] =
        data.histogram.results.slice(-2) ?? [];

      if (!currentWeekData) {
        return {
          allTimeAverage,
          weeklyAverage: "0%",
          weeklyAveragePercentageChange: undefined,
        };
      }

      const weeklyAveragePercentageChange =
        typeof currentWeekData.averageSuccessRate === "number" &&
        typeof previousWeekData.averageSuccessRate === "number" &&
        previousWeekData.averageSuccessRate !== 0
          ? currentWeekData.averageSuccessRate /
              previousWeekData.averageSuccessRate -
            1
          : undefined;

      return {
        allTimeAverage,
        weeklyAverage: currentWeekData.averageSuccessRate
          ? percentageFormatter.format(currentWeekData.averageSuccessRate / 100)
          : "N/A",
        weeklyAveragePercentageChange,
      };
    }, [data]);

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

        return {
          date: histogramEntry.week,
          averageSuccessRate: histogramEntry.averageSuccessRate ?? null,
          ...groupValues,
        };
      }
    );

    return [ranges, chartData];
  }, [data, groupingOption, mode, scale]);

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
        <h3 className="text-md font-medium">Retrievability Score</h3>
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

          <ChartStat label="All Time Average" value={allTimeAverage} />
        </div>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={400} debounce={200}>
          <ComposedChart
            data={chartData}
            margin={{
              left: 24,
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
              yAxisId="sp"
              fontSize={14}
              tickFormatter={formatValue}
              scale={scale === "log" ? scaleSymlog().constant(1) : "linear"}
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

            {ranges.map((range, rangeIndex) => (
              <Area
                key={`area_${rangeIndex}`}
                dataKey={indexToGroupKey(rangeIndex)}
                yAxisId="sp"
                stackId="ranges"
                type="monotone"
                name={getLabelForRange(range)}
                stroke={palette[rangeIndex]}
                fill={palette[rangeIndex]}
                animationDuration={animationDuration}
              />
            ))}

            <Line
              yAxisId="average"
              dataKey="averageSuccessRate"
              name="Average Success Rate"
              stroke="rgba(0, 0, 0, 0.5)"
              animationDuration={animationDuration}
            />

            <Tooltip
              labelFormatter={formatDate}
              formatter={formatTooltipValue}
              content={CustomTooltipContent}
            />
          </ComposedChart>
        </ResponsiveContainer>
        {<OverlayLoader show={!data || isLongLoading} />}
      </div>
    </Card>
  );
}

function CustomTooltipContent(props: TooltipProps<number | string, string>) {
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
