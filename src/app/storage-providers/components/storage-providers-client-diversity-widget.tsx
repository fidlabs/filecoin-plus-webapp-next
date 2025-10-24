"use client";

import { ChartTooltip } from "@/components/chart-tooltip";
import { OverlayLoader } from "@/components/overlay-loader";
import { Card } from "@/components/ui/card";
import {
  ResponsiveHoverCard,
  ResponsiveHoverCardContent,
  ResponsiveHoverCardTrigger,
} from "@/components/ui/responsive-hover-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { type ICDPRange } from "@/lib/interfaces/cdp/cdp.interface";
import { bigintToPercentage, cn, mapObject } from "@/lib/utils";
import { weekFromDate, weekToReadableString } from "@/lib/weeks";
import { filesize } from "filesize";
import { InfoIcon } from "lucide-react";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useSWR from "swr";
import {
  fetchStorageProvidersClientDiversityData,
  FetchStorageProvidersClientDiversityDataParameters,
} from "../storage-providers-data";

type Threshold = [number, number];
type Group = (typeof groups)[number];
type GroupValues = Record<Group, bigint>;
type ChartDataEntry = {
  date: string;
} & Record<keyof GroupValues, number>;
type ChartData = ChartDataEntry[];
type CardProps = ComponentProps<typeof Card>;

interface StorageProvidersClientDiversityWidgetProps
  extends Omit<CardProps, "children"> {
  animationDuration?: number;
}

const groups = ["high", "middle", "low"] as const;
const groupLabelDict: Record<Group, string> = {
  high: "Above Range",
  middle: "In Range",
  low: "Below Range",
};
const groupColorsMap: Record<Group, string> = {
  high: "#66a61e",
  middle: "orange",
  low: "#ff0029",
};
const initialGroupValues: GroupValues = {
  high: 0n,
  middle: 0n,
  low: 0n,
};
const scales = ["linear", "percentage", "log"] as const;
const modes = ["datacap", "count"] as const;

const scalesLabelDict: Record<(typeof scales)[number], string> = {
  linear: "Linear",
  percentage: "Percentage",
  log: "Log",
};

const modesLabelDict: Record<(typeof modes)[number], string> = {
  datacap: "PiB",
  count: "Count",
};

const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

export function StorageProvidersClientDiversityWidget({
  animationDuration = 500,
  className,
  ...rest
}: StorageProvidersClientDiversityWidgetProps) {
  const [scale, setScale] = useState<string>(scales[0]);
  const [mode, setMode] = useState<string>(modes[0]);
  const [threshold, setThreshold] = useState<Threshold>([3, 15]);

  const [editionId, setEditionId] = useState<string>();
  const parameters: FetchStorageProvidersClientDiversityDataParameters = {
    editionId,
  };

  const { data, isLoading } = useSWR(
    [QueryKey.STORAGE_PROVIDERS_CLIENT_DIVERSITY_DATA, parameters],
    ([, fetchParameters]) =>
      fetchStorageProvidersClientDiversityData(fetchParameters),
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 1000);

  const chartData = useMemo<ChartData>(() => {
    if (!data) {
      return [];
    }

    return data.results.map<ChartDataEntry>((weekEntry) => {
      const weekTotal =
        scale === "percentage"
          ? weekEntry.results.reduce((total, range) => {
              return total + getRangeValue(range, mode);
            }, 0n)
          : 1n;

      const rawGroupValues = weekEntry.results.reduce<GroupValues>(
        (result, range) => {
          const rangeGroup = getGroupForRange(range, threshold);

          return {
            ...result,
            [rangeGroup]: result[rangeGroup] + getRangeValue(range, mode),
          };
        },
        initialGroupValues
      );

      const groupValues = mapObject(rawGroupValues, (value) => {
        return scale === "percentage"
          ? bigintToPercentage(value, weekTotal)
          : Number(value);
      });

      return {
        date: weekEntry.week,
        ...groupValues,
      };
    });
  }, [data, mode, scale, threshold]);

  const formatValue = useCallback(
    (value: string | number) => {
      if (scale === "percentage") {
        return typeof value === "number"
          ? percentageFormatter.format(value / 100)
          : value;
      }

      if (mode === "datacap") {
        return filesize(value, { standard: "iec" });
      }

      return String(value);
    },
    [mode, scale]
  );

  const handleEditionChange = useCallback((value: string) => {
    setEditionId(value === "all" ? undefined : value);
  }, []);

  return (
    <Card {...rest} className={cn("pb-6", className)}>
      <header className="px-4 py-4 max-w-[min(50vw, 200px)]">
        <h3 className="text-lg font-medium">Client Diversity</h3>
        <p className="text-xs text-muted-foreground">
          Storage Providers grouped by Clients count
        </p>
      </header>

      <div className="px-4 flex flex-wrap items-center gap-2 mb-8">
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

        <Select value={editionId ?? "all"} onValueChange={handleEditionChange}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="All Editions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Editions</SelectItem>
            <SelectItem value="5">Edition 5</SelectItem>
            <SelectItem value="6">Edition 6</SelectItem>
          </SelectContent>
        </Select>

        <ThresholdSlider
          threshold={threshold}
          onThresholdChange={setThreshold}
        />
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={500} debounce={200}>
          <AreaChart
            data={chartData}
            margin={{
              left: 16,
              right: 16,
              bottom: 32,
            }}
          >
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              fontSize={12}
              angle={90}
              tickMargin={24}
            />

            <YAxis
              tickFormatter={formatValue}
              fontSize={14}
              scale={scale === "log" ? "symlog" : "linear"}
            />

            {groups.map((group) => (
              <Area
                key={group}
                dataKey={group}
                type="monotone"
                name={groupLabelDict[group]}
                fill={groupColorsMap[group]}
                stroke={groupColorsMap[group]}
                stackId="groups"
                animationDuration={animationDuration}
              />
            ))}

            <Tooltip<string | number, string>
              labelFormatter={formatDate}
              formatter={formatValue}
              content={ChartTooltip}
            />
          </AreaChart>
        </ResponsiveContainer>
        <OverlayLoader show={!data || isLongLoading} />
      </div>
    </Card>
  );
}

interface ThresholdSliderProps {
  threshold: Threshold;
  onThresholdChange(threshold: Threshold): void;
}

function ThresholdSlider({
  threshold,
  onThresholdChange,
}: ThresholdSliderProps) {
  const handleSliderValueChange = useCallback(
    (value: number[]) => {
      const lowerBound = value[0] ?? 0;
      const nextThreshold: Threshold = [lowerBound, value[1] ?? lowerBound + 1];
      onThresholdChange(nextThreshold);
    },
    [onThresholdChange]
  );

  return (
    <div className="flex flex-col">
      <div className="flex gap-1 items-center justify-between">
        <p className="text-sm">
          Threshold: {threshold[0]} - {threshold[1]}
        </p>
        <ResponsiveHoverCard>
          <ResponsiveHoverCardTrigger>
            <InfoIcon className="w-5 h-5 text-muted-foreground" />
          </ResponsiveHoverCardTrigger>
          <ResponsiveHoverCardContent>
            <div className="p-4 md:p-2 font-normal">
              Use this slider to adjust the ranges for the client count for
              storage provider
              <br />
              <div className="text-muted-foreground">
                eg. {threshold[0]}-{threshold[1]} range means that:
                <ul className="list-disc">
                  <li className="m-4">
                    0-{threshold[0]} clients will be marked as low client
                    diversity
                  </li>
                  <li className="m-4">
                    {threshold[0]}-{threshold[1]} clients will be marked as
                    medium client diversity
                  </li>
                  <li className="m-4">
                    {threshold[1]}+ clients will be marked as high client
                    diversity
                  </li>
                </ul>
              </div>
            </div>
          </ResponsiveHoverCardContent>
        </ResponsiveHoverCard>
      </div>

      <Slider
        className="min-w-[250px]"
        value={threshold}
        max={25}
        min={1}
        step={1}
        onValueChange={handleSliderValueChange}
      />
    </div>
  );
}

function getRangeValue(range: ICDPRange, mode: string): bigint {
  return mode === "datacap" ? BigInt(range.totalDatacap) : BigInt(range.count);
}

function getGroupForRange(
  range: ICDPRange,
  threshold: Threshold
): keyof GroupValues {
  const { valueFromExclusive, valueToInclusive } = range;
  const [lowerBound, upperBound] = threshold;

  if (valueFromExclusive > lowerBound && valueToInclusive <= upperBound) {
    return "middle";
  }

  return valueToInclusive >= upperBound ? "high" : "low";
}

function formatDate(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  return weekToReadableString(weekFromDate(input));
}
