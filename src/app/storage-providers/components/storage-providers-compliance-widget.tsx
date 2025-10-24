"use client";

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
import { bigintToPercentage, cn, objectToURLSearchParams } from "@/lib/utils";
import { weekFromDate, weekToReadableString, weekToString } from "@/lib/weeks";
import { filesize } from "filesize";
import { useRouter } from "next/navigation";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
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
  fetchStorageProvidersComplianceData,
  FetchStorageProvidersComplianceDataParameters,
} from "../storage-providers-data";
import {
  StorageProvidersComplianceMetricsSelector,
  StorageProvidersComplianceMetricsSelectorProps,
} from "./storage-providers-compliance-metrics-selector";

type CardProps = ComponentProps<typeof Card>;
export interface StorageProvidersComplianceWidgetProps
  extends Omit<CardProps, "children"> {
  animationDuration?: number;
}

interface ChartDataEntry {
  date: string;
  compliant: number;
  partiallyCompliant: number;
  nonCompliant: number;
}

interface Stat {
  value: string;
  percentageChange: number;
  label: string;
}

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

const colors = {
  compliant: "#66a61e",
  partiallyCompliant: "orange",
  nonCompliant: "#ff0029",
} as const;

export function StorageProvidersComplianceWidget({
  animationDuration = 500,
  className,
  ...rest
}: StorageProvidersComplianceWidgetProps) {
  const [scale, setScale] = useState<string>(scales[0]);
  const [mode, setMode] = useState<string>(modes[0]);
  const { push: navigate } = useRouter();

  const [parameters, setParameters] =
    useState<FetchStorageProvidersComplianceDataParameters>({
      editionId: undefined,
      retrievability: true,
      numberOfClients: true,
      totalDealSize: true,
    });

  const { data, isLoading } = useSWR(
    [QueryKey.STORAGE_PROVIDERS_COMPLIANCE_DATA, parameters],
    ([, fetchParameters]) =>
      fetchStorageProvidersComplianceData(fetchParameters),
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const stats = useMemo<Stat[]>(() => {
    const [previousIntervalData, currentIntervalData] =
      data?.results.slice(-2) ?? [];
    const [
      [previousCompliantDatacap, previousCompliantSPCount],
      [currentCompliantDatacap, currentCompliantSPCount],
    ] = [previousIntervalData, currentIntervalData].map((entry) => {
      if (!entry) {
        return [0n, 0n];
      }

      return [
        BigInt(entry.compliantSpsTotalDatacap),
        BigInt(entry.compliantSps),
      ];
    });

    return [
      {
        value: filesize(currentCompliantDatacap, { standard: "iec" }),
        label: "Compliant DC",
        percentageChange:
          bigintToPercentage(
            currentCompliantDatacap,
            previousCompliantDatacap,
            2
          ) - 100,
      },
      {
        value: currentCompliantSPCount.toString(),
        label: "Compliant SPs",
        percentageChange:
          bigintToPercentage(
            currentCompliantSPCount,
            previousCompliantSPCount,
            2
          ) - 100,
      },
    ];
  }, [data]);

  const chartData = useMemo<ChartDataEntry[]>(() => {
    if (!data) {
      return [];
    }

    return data.results.map<ChartDataEntry>((result) => {
      const [compliant, partiallyCompliant, nonCompliant] =
        mode === "datacap"
          ? [
              result.compliantSpsTotalDatacap,
              result.partiallyCompliantSpsTotalDatacap,
              result.nonCompliantSpsTotalDatacap,
            ].map(BigInt)
          : [
              result.compliantSps,
              result.partiallyCompliantSps,
              result.nonCompliantSps,
            ].map(BigInt);

      if (scale === "percentage") {
        const total = compliant + partiallyCompliant + nonCompliant;

        return {
          date: result.week,
          compliant: bigintToPercentage(compliant, total, 6),
          partiallyCompliant: bigintToPercentage(partiallyCompliant, total, 6),
          nonCompliant: bigintToPercentage(nonCompliant, total, 6),
        };
      }

      return {
        date: result.week,
        compliant: Number(compliant),
        partiallyCompliant: Number(partiallyCompliant),
        nonCompliant: Number(nonCompliant),
      };
    });
  }, [data, mode, scale]);

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
    StorageProvidersComplianceMetricsSelectorProps["onMetricsChange"]
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
        `/storage-providers/compliance/${weekString}?${searchParams.toString()}`
      );
    },
    [navigate, parameters]
  );

  return (
    <Card {...rest} className={cn("pb-6", className)}>
      <header className="px-4 py-4">
        <h3 className="text-lg font-medium">Compliance</h3>
        <p className="text-xs text-muted-foreground">
          Select metrics below to see Storage Providers compliance
        </p>
      </header>

      <div className="px-4 pb-4 mb-4 border-b">
        <StorageProvidersComplianceMetricsSelector
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
          Hover and click on the chart to see a list of Storage Providers
          matching selected criteria for that week.
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
            <Area
              className="cursor-pointer"
              type="monotone"
              stackId="values"
              dataKey="compliant"
              name="Compliant"
              animationDuration={animationDuration}
              stroke={colors.compliant}
              fill={colors.compliant}
            />
            <Area
              className="cursor-pointer"
              type="monotone"
              stackId="values"
              dataKey="partiallyCompliant"
              name="Partially Compliant"
              animationDuration={animationDuration}
              stroke={colors.partiallyCompliant}
              fill={colors.partiallyCompliant}
            />
            <Area
              className="cursor-pointer"
              type="monotone"
              stackId="values"
              dataKey="nonCompliant"
              name="Non Compliant"
              animationDuration={animationDuration}
              stroke={colors.nonCompliant}
              fill={colors.nonCompliant}
            />
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
