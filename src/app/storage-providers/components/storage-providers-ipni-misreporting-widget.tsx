"use client";

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
import { weekFromDate, weekToReadableString } from "@/lib/weeks";
import { scaleSymlog } from "d3-scale";
import { ComponentProps, useCallback, useMemo, useState } from "react";
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
  fetchStorageProvidersIPNIMisreportingData,
  FetchStorageProvidersIPNIMistreportingDataParameters,
} from "../storage-providers-data";
import { cn } from "@/lib/utils";

type CardProps = ComponentProps<typeof Card>;
export interface StorageProvidersComplianceWidgetProps
  extends Omit<CardProps, "children"> {
  animationDuration?: number;
}

type ReportingState = (typeof reportingStates)[number];
type ChartDataEntry = {
  date: string;
} & Record<ReportingState, number>;

const reportingStates = ["notReporting", "misreporting", "ok"] as const;
const scales = ["linear", "percentage", "log"] as const;

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
  notReporting: "#999",
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

  const handleEditionChange = useCallback((value: string) => {
    setEditionId(value === "all" ? undefined : value);
  }, []);

  return (
    <Card {...rest} className={cn("pb-6", className)}>
      <header className="px-4 py-4">
        <h3 className="text-md font-medium">IPNI Mistreporting</h3>
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
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={400} debounce={500}>
          <AreaChart
            data={chartData}
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
              scale={scale === "log" ? scaleSymlog().constant(1) : "linear"}
            />

            {reportingStates.map((reportingState) => (
              <Area
                key={reportingState}
                type="monotone"
                stackId="values"
                dataKey={reportingState}
                name={reportingStateLabelDict[reportingState]}
                animationDuration={animationDuration}
                stroke={colors[reportingState]}
                fill={colors[reportingState]}
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
