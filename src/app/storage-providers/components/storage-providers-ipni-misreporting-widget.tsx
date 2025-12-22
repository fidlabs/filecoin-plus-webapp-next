"use client";

import { ChartStat } from "@/components/chart-stat";
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
import { ArrayElement, cn } from "@/lib/utils";
import { weekFromDate, weekToReadableString } from "@/lib/weeks";
import { ComponentProps, useCallback, useMemo, useState } from "react";
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
  fetchStorageProvidersIPNIMisreportingData,
  FetchStorageProvidersIPNIMistreportingDataParameters,
} from "../storage-providers-data";

type CardProps = ComponentProps<typeof Card>;
export interface StorageProvidersComplianceWidgetProps
  extends Omit<CardProps, "children"> {
  animationDuration?: number;
}

type ReportingState = ArrayElement<typeof reportingStates>;
type EnabledChartType = ArrayElement<typeof enabledChartTypes>;
type ChartDataEntry = {
  date: string;
} & Record<ReportingState, number>;

interface Stat {
  value: string;
  percentageChange?: number;
  label: string;
}

const reportingStates = ["notReporting", "misreporting", "ok"] as const;
const scales = ["linear", "percentage", "log"] as const;
const enabledChartTypes = ["area", "bar"] as const satisfies ChartType[];

const reportingStateLabelDict: Record<ReportingState, string> = {
  ok: "IPNI OK",
  misreporting: "IPNI Misreporting",
  notReporting: "IPNI Not Reporting",
};

const scalesLabelDict: Record<(typeof scales)[number], string> = {
  linear: "Linear",
  percentage: "Percentage",
  log: "Log",
};

const colors = {
  ok: "#66a61e",
  misreporting: "#ff0029",
  notReporting: "#AAA",
} as const satisfies Record<ReportingState, string>;

const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

export function StorageProvidersIPNIMisreportingWidget({
  animationDuration = 500,
  className,
  ...rest
}: StorageProvidersComplianceWidgetProps) {
  const [editionId, setEditionId] = useState<string>();
  const [scale, setScale] = useState<string>(scales[0]);
  const [chartType, setChartType] = useState<EnabledChartType>("bar");
  const { chartWrapperRef, barsCount } = useDynamicBarsCount({
    minBarSize: 12,
    margins: 116,
  });

  const parameters: FetchStorageProvidersIPNIMistreportingDataParameters = {
    editionId,
  };

  const { data, isLoading } = useSWR(
    [QueryKey.STORAGE_PROVIDERS_IPNI_MISREPORTING_DATA, parameters],
    ([, fetchParameters]) =>
      fetchStorageProvidersIPNIMisreportingData(fetchParameters),
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const chartData = useMemo<ChartDataEntry[]>(() => {
    if (!data) {
      return [];
    }

    return data.results.map<ChartDataEntry>((result) => {
      const { week, ok, misreporting, notReporting, total } = result;

      if (scale === "percentage") {
        return {
          date: week,
          ok: (ok * 100) / total,
          misreporting: (misreporting * 100) / total,
          notReporting: (notReporting * 100) / total,
        };
      }

      return {
        date: week,
        ok,
        misreporting,
        notReporting,
      };
    });
  }, [data, scale]);

  const formatDate = useCallback((value: unknown) => {
    if (typeof value !== "string") {
      return String(value);
    }

    return weekToReadableString(weekFromDate(value));
  }, []);

  const formatValue = useCallback(
    (value: string | number) => {
      if (scale === "percentage") {
        return typeof value === "number"
          ? percentageFormatter.format(value / 100)
          : value;
      }
      return String(value);
    },
    [scale]
  );

  const stats = useMemo<Stat[]>(() => {
    const [currentIntervalData, previousIntervalData] = chartData
      .slice(-2)
      .reverse();

    if (!currentIntervalData) {
      return [];
    }

    return reportingStates.toReversed().map<Stat>((reportingState) => {
      const currentValue = currentIntervalData[reportingState];

      if (!previousIntervalData) {
        return {
          value: formatValue(currentValue),
          label: reportingStateLabelDict[reportingState],
        };
      }

      const previousValue = previousIntervalData[reportingState];

      return {
        value: formatValue(currentValue),
        label: reportingStateLabelDict[reportingState],
        percentageChange: currentValue / previousValue - 1,
      };
    });
  }, [chartData, formatValue]);

  const handleEditionChange = useCallback((value: string) => {
    setEditionId(value === "all" ? undefined : value);
  }, []);

  return (
    <Card {...rest} className={cn("pb-6", className)}>
      <header className="px-4 py-4">
        <h3 className="text-lg font-medium">IPNI Mistreporting</h3>
        <p className="text-xs text-muted-foreground">
          Storage Providers IPNI reporting status over time
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2 px-4 mb-4">
        <Select value={editionId ?? "all"} onValueChange={handleEditionChange}>
          <Tabs value={scale} onValueChange={setScale}>
            <TabsList>
              {scales.map((possibleScale) => (
                <TabsTrigger key={possibleScale} value={possibleScale}>
                  {scalesLabelDict[possibleScale]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

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

      <div className="px-4 flex flex-wrap gap-x-8">
        {stats.map((stat, index) => {
          return (
            <ChartStat
              key={`stat_${index}`}
              label={stat.label}
              value={stat.value}
              percentageChange={stat.percentageChange}
              placeholderWidth={160}
            />
          );
        })}
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
              left: 16,
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
              fontSize={14}
              tickFormatter={formatValue}
              scale={scale === "log" ? "symlog" : "linear"}
            />

            {reportingStates.map((reportingState) => {
              switch (chartType) {
                case "area":
                  return (
                    <Area
                      key={`${reportingState}_area`}
                      type="monotone"
                      stackId="areas"
                      dataKey={reportingState}
                      name={reportingStateLabelDict[reportingState]}
                      animationDuration={animationDuration}
                      stroke={colors[reportingState]}
                      fill={colors[reportingState]}
                    />
                  );
                case "bar":
                  return (
                    <Bar
                      key={`${reportingState}_bar`}
                      stackId="bars"
                      dataKey={reportingState}
                      name={reportingStateLabelDict[reportingState]}
                      animationDuration={animationDuration}
                      fill={colors[reportingState]}
                      stroke="#000"
                      strokeWidth={1}
                    />
                  );
              }
            })}

            <Tooltip<string | number, string>
              formatter={formatValue}
              labelFormatter={formatDate}
              content={ChartTooltip}
            />
          </ComposedChart>
        </ResponsiveContainer>
        {<OverlayLoader show={!data || isLongLoading} />}
      </div>
    </Card>
  );
}
