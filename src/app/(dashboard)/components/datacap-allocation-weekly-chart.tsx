"use client";

import { ChartTooltip } from "@/components/chart-tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartLoader } from "@/components/ui/chart-loader";
import { QueryKey } from "@/lib/constants";
import { palette } from "@/lib/utils";
import { weekToReadableString } from "@/lib/weeks";
import { filesize } from "filesize";
import { useCallback, useEffect, useMemo } from "react";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useSWR from "swr";
import { useMediaQuery } from "usehooks-ts";
import { fetchCumulativeAllocationsHistory } from "../dashboard-data";

interface ChartDataEntry {
  name: string;
  value: number;
}

export function DatacapAllocationWeeklyChart() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { data, error, isLoading, mutate } = useSWR(
    QueryKey.ALLOCATORS_CUMULATIVE_ALLOCATIONS_HISTORY,
    fetchCumulativeAllocationsHistory,
    {
      keepPreviousData: true,
      revalidateOnMount: false,
    }
  );

  useEffect(() => {
    if (!data && !error && !isLoading) {
      mutate();
    }
  }, [data, error, isLoading, mutate]);

  const chartData = useMemo<ChartDataEntry[]>(() => {
    if (!data) {
      return [];
    }

    return data.map(({ year, week: weekNumber, cumulativeTotal }) => {
      return {
        name: weekToReadableString({ year, weekNumber }),
        value: Number(BigInt(cumulativeTotal)),
      };
    });
  }, [data]);

  const formatBytes = useCallback((value: unknown) => {
    if (
      typeof value === "bigint" ||
      typeof value === "number" ||
      typeof value === "string"
    ) {
      return filesize(value, { standard: "iec" });
    }

    return String(value);
  }, []);

  return (
    <Card>
      <CardHeader className="flex-col items-start">
        <CardTitle>Accumulated DataCap Allocation to Clients</CardTitle>
        <CardDescription>
          How much DataCap was used by allocators/given out to clients so far
        </CardDescription>
      </CardHeader>
      <CardContent className="flex w-full items-center justify-center">
        {!!error && !isLoading && <p>Error loading data</p>}
        <ResponsiveContainer
          width="100%"
          aspect={isDesktop ? 1.77 : 16 / chartData.length}
          debounce={500}
        >
          {isLoading && <ChartLoader />}

          <LineChart
            data={chartData}
            layout={isDesktop ? "horizontal" : "vertical"}
            margin={{ right: 50, left: 20, bottom: 84 }}
          >
            {isDesktop && (
              <XAxis
                dataKey="name"
                interval={1}
                minTickGap={0}
                tick={<CustomizedAxisTick />}
              />
            )}
            {isDesktop && (
              <YAxis
                dataKey="value"
                domain={["dataMin", "dataMax"]}
                tickFormatter={formatBytes}
                tick={{
                  fontSize: 12,
                  fontWeight: 500,
                  fill: "var(--muted-foreground)",
                }}
              />
            )}
            {!isDesktop && (
              <YAxis
                dataKey="name"
                type="category"
                interval={0}
                minTickGap={0}
                tick={<CustomizedAxisTickMobile />}
              />
            )}
            {!isDesktop && (
              <XAxis
                dataKey="value"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={formatBytes}
                tick={{
                  fontSize: 12,
                  fontWeight: 500,
                  fill: "var(--muted-foreground)",
                }}
              />
            )}
            <Tooltip content={ChartTooltip} formatter={formatBytes} />
            <Legend align="center" verticalAlign="top" />
            <Line
              isAnimationActive={false}
              layout={isDesktop ? "horizontal" : "vertical"}
              name="Cumulative Total Allocated Datacap"
              type="monotone"
              dataKey="value"
              stroke={palette(0)}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

const CustomizedAxisTick = (props: {
  x?: number;
  y?: number;
  stroke?: string;
  payload?: { value: string };
}) => {
  const {
    x,
    y,
    payload = {
      value: "",
    },
  } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dx={5}
        dy={10}
        fontSize={13}
        textAnchor="start"
        fill="#666"
        transform="rotate(65)"
      >
        {payload.value.substring(0, 25)}
        {payload.value.length > 25 ? "..." : ""}
      </text>
    </g>
  );
};

const CustomizedAxisTickMobile = (props: {
  x?: number;
  y?: number;
  stroke?: string;
  payload?: { value: string };
}) => {
  const {
    x,
    y,
    payload = {
      value: "",
    },
  } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dx={-5}
        dy={5}
        fontSize={13}
        textAnchor="end"
        fill="#666"
      >
        {payload.value.substring(0, 25)}
        {payload.value.length > 25 ? "..." : ""}
      </text>
    </g>
  );
};
