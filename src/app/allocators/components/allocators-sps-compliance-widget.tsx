"use client";

import { AllocatorsComplianceThresholdSelector } from "@/components/allocators-compliance-threshold-selector";
import { ChartStat } from "@/components/chart-stat";
import { ChartTooltip } from "@/components/chart-tooltip";
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
import {
  bigintToPercentage,
  cn,
  objectToURLSearchParams,
  partition,
} from "@/lib/utils";
import { weekFromDate, weekToReadableString, weekToString } from "@/lib/weeks";
import { filesize } from "filesize";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, type ComponentProps } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type CategoricalChartFunc } from "recharts/types/chart/types";
import useSWR from "swr";
import {
  fetchAllocatorsSPsComplianceData,
  FetchAllocatorsSPsComplianceDataReturnType,
  type FetchAllocatorsSPsComplianceDataParameters,
} from "../allocators-data";
import {
  AllocatorsSPsComplianceMetricsSelector,
  AllocatorsSPsComplianceMetricsSelectorProps,
} from "./allocators-sps-compliance-metrics-selector";

type CardProps = ComponentProps<typeof Card>;
export interface AllocatorsSPsComplianceWidgetProps
  extends Omit<CardProps, "children"> {
  animationDuration?: number;
}

type Option = (typeof options)[number];
type Variation = (typeof variations)[number];
type Combination = `${Option}${Capitalize<Variation>}`;
type AllocatorData =
  FetchAllocatorsSPsComplianceDataReturnType["results"][number]["allocators"][number];

type ChartDataEntry = Record<Combination, number> & {
  date: string;
};

interface Stat {
  value: string;
  percentageChange: number;
  label: string;
}

interface AreaMetadata {
  dataKey: Combination;
  color: string;
  name: string;
}

const options = ["compliant", "partiallyCompliant", "nonCompliant"] as const;
const variations = [
  "count",
  "countPercentage",
  "datacap",
  "datacapPercentage",
] as const;
const scales = ["linear", "percentage", "log"] as const;
const modes = ["datacap", "count"] as const;

const optionsLabelDict: Record<Option, string> = {
  compliant: "Compliant",
  partiallyCompliant: "Partially Compliant",
  nonCompliant: "Non Compliant",
};

const scalesLabelDict: Record<(typeof scales)[number], string> = {
  linear: "Linear",
  percentage: "Percentage",
  log: "Log",
};

const modesLabelDict: Record<(typeof modes)[number], string> = {
  datacap: "PiB",
  count: "Count",
};

const colors: Record<Option, string> = {
  compliant: "#66a61e",
  partiallyCompliant: "orange",
  nonCompliant: "#ff0029",
} as const;

function sumAllocatorsDatacap(allocators: AllocatorData[]): bigint {
  return allocators.reduce(
    (sum, allocator) => sum + BigInt(allocator.totalDatacap),
    0n
  );
}

export function AllocatorsSPsComplianceWidget({
  animationDuration = 500,
  className,
  ...rest
}: AllocatorsSPsComplianceWidgetProps) {
  const [scale, setScale] = useState<string>(scales[0]);
  const [mode, setMode] = useState<string>(modes[0]);
  const [threshold, setThreshold] = useState(50);
  const { push: navigate } = useRouter();

  const [parameters, setParameters] =
    useState<FetchAllocatorsSPsComplianceDataParameters>({
      editionId: undefined,
      retrievability: true,
      numberOfClients: true,
      totalDealSize: true,
    });

  const { data, isLoading } = useSWR(
    [QueryKey.ALLOCATORS_SPS_COMPLIANCE_DATA, parameters],
    ([, fetchParameters]) => fetchAllocatorsSPsComplianceData(fetchParameters),
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const areas = useMemo(() => {
    return options.map<AreaMetadata>((option) => {
      const name = optionsLabelDict[option];
      const color = colors[option];

      if (scale === "percentage") {
        return {
          dataKey:
            mode === "datacap"
              ? `${option}DatacapPercentage`
              : `${option}CountPercentage`,
          name,
          color,
        };
      }

      return {
        dataKey: mode === "datacap" ? `${option}Datacap` : `${option}Count`,
        name,
        color,
      };
    });
  }, [mode, scale]);

  const chartData = useMemo<ChartDataEntry[]>(() => {
    if (!data) {
      return [];
    }

    return data.results.map<ChartDataEntry>((result) => {
      const [compliantAllocators, otherAllocators] = partition(
        result.allocators,
        (allocator) => allocator.compliantSpsPercentage >= threshold
      );
      const [partiallyCompliantAllocators, nonCompliantAllocators] = partition(
        otherAllocators,
        (allocator) =>
          allocator.compliantSpsPercentage +
            allocator.partiallyCompliantSpsPercentage >=
          threshold
      );
      const compliantCount = compliantAllocators.length;
      const partiallyCompliantCount = partiallyCompliantAllocators.length;
      const nonCompliantCount = partiallyCompliantAllocators.length;
      const totalCount =
        compliantCount + partiallyCompliantCount + nonCompliantCount;
      const compliantDatacap = sumAllocatorsDatacap(compliantAllocators);
      const partiallyCompliantDatacap = sumAllocatorsDatacap(
        partiallyCompliantAllocators
      );
      const nonCompliantDatacap = sumAllocatorsDatacap(nonCompliantAllocators);
      const totalDatacap =
        compliantDatacap + partiallyCompliantDatacap + nonCompliantDatacap;

      return {
        date: result.week,
        compliantCount,
        partiallyCompliantCount,
        nonCompliantCount,
        compliantDatacap: Number(compliantDatacap),
        partiallyCompliantDatacap: Number(partiallyCompliantDatacap),
        nonCompliantDatacap: Number(nonCompliantDatacap),
        compliantCountPercentage: (compliantCount / totalCount) * 100,
        partiallyCompliantCountPercentage:
          (partiallyCompliantCount / totalCount) * 100,
        nonCompliantCountPercentage: (compliantCount / totalCount) * 100,
        compliantDatacapPercentage: bigintToPercentage(
          compliantDatacap,
          totalDatacap,
          2
        ),
        partiallyCompliantDatacapPercentage: bigintToPercentage(
          partiallyCompliantDatacap,
          totalDatacap,
          2
        ),
        nonCompliantDatacapPercentage: bigintToPercentage(
          nonCompliantDatacap,
          totalDatacap,
          2
        ),
      };
    });
  }, [data, threshold]);

  const stats = useMemo<Stat[]>(() => {
    const [currentIntervalData, previousIntervalData] = chartData
      .slice(-2)
      .reverse();

    if (!currentIntervalData) {
      return [];
    }

    return [
      {
        value: filesize(currentIntervalData.compliantDatacap, {
          standard: "iec",
        }),
        label: "Compliant DC",
        percentageChange:
          bigintToPercentage(
            BigInt(currentIntervalData.compliantDatacap),
            BigInt(previousIntervalData.compliantDatacap),
            2
          ) - 100,
      },
      {
        value: currentIntervalData.compliantCount.toString(),
        label: "Compliant Allocators",
        percentageChange:
          currentIntervalData.compliantCount /
            previousIntervalData.compliantCount -
          1,
      },
    ];
  }, [chartData]);

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

  const handleEditionChange = useCallback((value: string) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      editionId: value === "all" ? undefined : value,
    }));
  }, []);

  const handleMetricsChange = useCallback<
    AllocatorsSPsComplianceMetricsSelectorProps["onMetricsChange"]
  >((metrics) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      ...metrics,
    }));
  }, []);

  const handleChartClick = useCallback<CategoricalChartFunc>(
    (state) => {
      if (typeof state.activeLabel !== "string") {
        return;
      }

      const week = weekFromDate(state.activeLabel);
      const weekString = week ? weekToString(week) : "latest";

      const searchParams = objectToURLSearchParams(
        {
          complianceScore: "compliant",
          retrievability: parameters.retrievability,
          numberOfClients: parameters.numberOfClients,
          totalDealSize: parameters.totalDealSize,
        },
        true
      );

      navigate(
        `/allocators/compliance/${weekString}?${searchParams.toString()}`
      );
    },
    [navigate, parameters]
  );

  return (
    <Card {...rest} className={cn("pb-6", className)}>
      <header className="px-4 py-4">
        <h3 className="text-md font-medium">Compliance</h3>
        <p className="text-xs text-muted-foreground">
          Select metrics below to see Allocators compliance based on their SPs
          compliance
        </p>
      </header>

      <div className="px-4 pb-4 mb-4 border-b">
        <AllocatorsSPsComplianceMetricsSelector
          includeDisabledMetricsOnChange
          metrics={parameters}
          onMetricsChange={handleMetricsChange}
        />
      </div>

      <div className="px-4 mb-8 flex flex-wrap gap-y-4 justify-between items-start">
        <div className="flex flex-wrap gap-x-8">
          {stats.map((stat, index) => {
            return (
              <ChartStat
                key={`stat_${index}`}
                label={stat.label}
                value={stat.value}
                percentageChange={stat.percentageChange / 100}
                placeholderWidth={160}
              />
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AllocatorsComplianceThresholdSelector
            key="threshold"
            value={threshold}
            onThresholdChange={setThreshold}
          />
          <Select
            value={parameters.editionId ?? "all"}
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

          <Tabs value={scale} onValueChange={setScale}>
            <TabsList>
              {scales.map((possibleScale) => (
                <TabsTrigger key={possibleScale} value={possibleScale}>
                  {scalesLabelDict[possibleScale]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Tabs value={mode} onValueChange={setMode}>
            <TabsList>
              {modes.map((possibleMode) => (
                <TabsTrigger key={possibleMode} value={possibleMode}>
                  {modesLabelDict[possibleMode]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="px-4 mb-2">
        <p className="text-xs text-muted-foreground text-center">
          Hover and click on the chart to see a list of Allocators matching
          selected criteria for that week.
        </p>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={400} debounce={200}>
          <AreaChart
            data={chartData}
            margin={{
              left: 24,
              right: 16,
              bottom: 32,
              top: 32,
            }}
            onClick={handleChartClick}
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

            {areas.map((area) => (
              <Area
                key={area.dataKey}
                className="cursor-pointer"
                type="monotone"
                stackId="values"
                dataKey={area.dataKey}
                name={area.name}
                animationDuration={animationDuration}
                stroke={area.color}
                fill={area.color}
              />
            ))}

            <Tooltip<string | number, string>
              formatter={formatValue}
              labelFormatter={formatDate}
              content={ChartTooltip}
            />
          </AreaChart>
        </ResponsiveContainer>
        {<OverlayLoader show={!data || isLongLoading} />}
      </div>
    </Card>
  );
}
