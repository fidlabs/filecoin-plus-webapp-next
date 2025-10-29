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
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { cn, palette } from "@/lib/utils";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
import {
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useSWR from "swr";
import {
  fetchAllocatorsAuditTimes,
  FetchAllocatorsAuditTimesParameters,
} from "../allocators-data";

type CardProps = ComponentProps<typeof Card>;
type Metric = (typeof metrics)[number];
type ChartEntry = Partial<Record<Metric, number>> & {
  name: string;
};

export interface AllocatorsAuditTimesWidgetProps
  extends Omit<CardProps, "children"> {
  animationDuration?: number;
}

const metrics = [
  "averageAuditTimeSecs",
  "averageAllocationTimeSecs",
  "averageConversationTimeSecs",
] as const;
const metricsLabelDict: Record<Metric, string> = {
  averageAllocationTimeSecs: "Average Allocation Time",
  averageAuditTimeSecs: "Average Audit TIme",
  averageConversationTimeSecs: "Average Conversation Time",
};
const metricsColors: Record<Metric, string> = {
  averageAllocationTimeSecs: palette(3),
  averageAuditTimeSecs: palette(4),
  averageConversationTimeSecs: palette(5),
};
const oneDayInSeconds = 60 * 60 * 24;

export function AllocatorsAuditTimesWidget({
  animationDuration,
  className,
  ...rest
}: AllocatorsAuditTimesWidgetProps) {
  const [parameters, setParameters] =
    useState<FetchAllocatorsAuditTimesParameters>({
      editionId: "6",
    });
  const { data, isLoading } = useSWR(
    [QueryKey.ALLOCATORS_AUDIT_TIMES, parameters],
    ([, fetchParameters]) => fetchAllocatorsAuditTimes(fetchParameters)
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const byAuditChartData = useMemo<ChartEntry[]>(() => {
    if (!data) {
      return [];
    }

    const roundsCount = Object.values(data.byRound).reduce((max, values) => {
      return values === null ? max : Math.max(max, values.length);
    }, 0);

    return [...Array(roundsCount)].map<ChartEntry>((_, roundIndex) => {
      return {
        name: `Audit ${roundIndex + 1}`,
        averageAllocationTimeSecs:
          data.byRound.averageAllocationTimesSecs?.[roundIndex],
        averageAuditTimeSecs: data.byRound.averageAuditTimesSecs?.[roundIndex],
        averageConversationTimeSecs:
          data.byRound.averageConversationTimesSecs?.[roundIndex],
      };
    });
  }, [data]);

  const byMonthChartData = useMemo<ChartEntry[]>(() => {
    if (!data) {
      return [];
    }

    return data.byMonth.map<ChartEntry>((item) => {
      return {
        name: new Date(item.month).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        averageAuditTimeSecs: item.averageAuditTimeSecs,
        averageAllocationTimeSecs: item.averageAllocationTimeSecs,
      };
    });
  }, [data]);

  const handleEditionChange = useCallback((editionId: string) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      editionId,
    }));
  }, []);

  return (
    <Card {...rest} className={cn("p-4", className)}>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">
            Governance Compliance Audit Timeline
          </h3>
          <p className="text-xs text-muted-foreground">
            Track average audit times on per audit and per month basis
          </p>
        </div>

        <Select
          value={parameters.editionId}
          onValueChange={handleEditionChange}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="All Editions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Edition 5</SelectItem>
            <SelectItem value="6">Edition 6</SelectItem>
          </SelectContent>
        </Select>
      </header>

      <div className="relative">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(500px, 100%), 1fr))",
          }}
        >
          <Chart
            data={byAuditChartData}
            chartLabel="Audit No."
            animationDuration={animationDuration}
          />

          <Chart
            data={byMonthChartData}
            chartLabel="Month"
            animationDuration={animationDuration}
          />
        </div>

        <OverlayLoader show={!data || isLongLoading} />
      </div>
    </Card>
  );
}

interface ChartProps {
  animationDuration?: number;
  chartLabel?: string;
  data: ChartEntry[];
}

function Chart({ animationDuration = 200, chartLabel, data }: ChartProps) {
  const formatValue = useCallback((value: number) => {
    const days = Math.ceil(value / oneDayInSeconds);
    return `${days}\u00A0day${days === 1 ? "" : "s"}`;
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300} debounce={200}>
      <LineChart data={data}>
        <XAxis dataKey="name" fontSize={12} tickMargin={8} height={48}>
          {!!chartLabel && (
            <Label fontSize={12} position="insideBottomRight" fill="#000">
              {chartLabel}
            </Label>
          )}
        </XAxis>
        <YAxis width="auto" fontSize={12} tickFormatter={formatValue} />

        {metrics.map((metric) => (
          <Line
            key={metric}
            dataKey={metric}
            type="monotone"
            name={metricsLabelDict[metric]}
            stroke={metricsColors[metric]}
            animationDuration={animationDuration}
          />
        ))}

        <Tooltip content={ChartTooltip} formatter={formatValue} />
      </LineChart>
    </ResponsiveContainer>
  );
}
