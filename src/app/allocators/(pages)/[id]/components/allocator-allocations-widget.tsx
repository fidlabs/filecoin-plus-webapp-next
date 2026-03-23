"use client";

import {
  fetchAllocatorAllocations,
  type FetchAllocatorAllocationsParameters,
} from "@/app/allocators/allocators-data";
import {
  ChartTooltipContainer,
  ChartTooltipHeader,
  ChartTooltipTitle,
} from "@/components/chart-tooltip";
import { Card } from "@/components/ui/card";
import { QueryKey } from "@/lib/constants";
import { palette } from "@/lib/utils";
import { weekFromDate, weekToReadableString } from "@/lib/weeks";
import { filesize } from "filesize";
import { type ComponentProps, useCallback, useMemo } from "react";
import {
  Area,
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import {
  type NameType,
  type ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import useSWR from "swr";

type CardProps = ComponentProps<typeof Card>;
export interface AllocatorAllocationsWidgetProps
  extends Omit<CardProps, "children"> {
  allocatorId: string;
}

interface Allocation {
  client: string;
  clientName: string;
  allocation: bigint;
  isNew: boolean;
}

interface ChartEntry {
  week: string;
  allocationsToDate: number;
  totalAllocations: number;
  allocations: Allocation[];
}

export function AllocatorAllocationsWidget({
  allocatorId,
  ...rest
}: AllocatorAllocationsWidgetProps) {
  const parameters: FetchAllocatorAllocationsParameters = {
    allocatorId,
    showAllocations: true,
    groupBy: "week",
    showEmptyPeriods: false,
  };

  const { data } = useSWR(
    [QueryKey.ALLOCATOR_ALLOCATIONS, parameters],
    ([, fetchParameters]) => {
      return fetchAllocatorAllocations(fetchParameters);
    },
    {
      keepPreviousData: true,
    }
  );

  const chartData = useMemo<ChartEntry[]>(() => {
    if (!data) {
      return [];
    }

    const clientsPairs = data.flatMap((item) => {
      return item.newClients.map<[string, string]>((newClient) => {
        return [newClient.client, newClient.clientName ?? newClient.client];
      });
    });

    const clientsMap = Object.fromEntries(clientsPairs);

    return data.map<ChartEntry>((item) => {
      const allocations = item.newAllocations
        ? item.newAllocations.map<Allocation>((newAllocation) => {
            return {
              client: newAllocation.client,
              clientName:
                clientsMap[newAllocation.client] ?? newAllocation.client,
              allocation: BigInt(newAllocation.allocation),
              isNew:
                item.newClients.findIndex((newClient) => {
                  return newClient.client === newAllocation.client;
                }) !== -1,
            };
          })
        : [];

      const totalAllocations = allocations.reduce((total, item) => {
        return total + item.allocation;
      }, 0n);

      return {
        week: item.date,
        allocationsToDate: Number(BigInt(item.totalAllocationsToDate)),
        totalAllocations: Number(totalAllocations),
        allocations,
      };
    });
  }, [data]);

  const formatXAxisTick = useCallback((value: unknown) => {
    if (typeof value !== "string") {
      return String(value);
    }

    return weekToReadableString(weekFromDate(value));
  }, []);

  const formatYAxisTick = useCallback((value: unknown) => {
    if (typeof value !== "number") {
      return String(value);
    }

    return filesize(value, { standard: "iec" });
  }, []);

  return (
    <Card {...rest}>
      <div className="p-4 mb-6">
        <header>
          <h3 className="text-xl font-medium">Allocation Over Time</h3>
        </header>
      </div>
      <div className="px-4">
        <ResponsiveContainer width="100%" height={500} debounce={150}>
          <ComposedChart data={chartData}>
            <XAxis
              dataKey="week"
              fontSize={12}
              tickFormatter={formatXAxisTick}
            />
            <YAxis
              domain={[0, "dataMax"]}
              fontSize={12}
              width="auto"
              tickFormatter={formatYAxisTick}
            />
            <Tooltip content={renderTooltip} />
            <Area
              name="Allocations Over Time"
              type="monotone"
              dataKey="allocationsToDate"
              stroke={palette(64)}
              fill={palette(64)}
            />
            <Bar dataKey="totalAllocations" fill={palette(0)} maxBarSize={32} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

const renderTooltip = (props: TooltipContentProps<ValueType, NameType>) => {
  const payload = props?.payload?.[0]?.payload;
  if (!payload) {
    return <></>;
  }
  const { week, allocationsToDate, allocations } = payload;

  return (
    <ChartTooltipContainer>
      <ChartTooltipHeader>
        <ChartTooltipTitle>
          {weekToReadableString(weekFromDate(week))}
        </ChartTooltipTitle>
        <p className="text-sm text-muted-foreground">
          Total Allocations to Date:{" "}
          <span className="font-semibold">
            {filesize(allocationsToDate, { standard: "iec" })}
          </span>
        </p>
      </ChartTooltipHeader>

      <ul>
        {(allocations as Allocation[]).map((allocation) => (
          <li key={allocation.client}>
            <span className="font-semibold text-dodger-blue">
              {allocation.clientName}
            </span>{" "}
            - {filesize(allocation.allocation, { standard: "iec" })}
            {allocation.isNew && (
              <span className="text-[10px] font-semibold px-2 py-1 bg-dodger-blue/50 border border-dodger-blue rounded-full ml-2">
                New Client
              </span>
            )}
          </li>
        ))}
      </ul>
    </ChartTooltipContainer>
  );
};
