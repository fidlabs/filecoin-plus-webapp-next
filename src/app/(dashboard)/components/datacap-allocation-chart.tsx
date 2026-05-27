"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActiveShapeSimple } from "@/components/ui/pie-active-shape";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryKey } from "@/lib/constants";
import { cn, palette } from "@/lib/utils";
import { filesize } from "filesize";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  PieProps,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import useSWR from "swr";
import { fetchDatacapUsageInfo } from "../dashboard-data";

const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

export function DatacapAllocationChart() {
  const [activeTooltipIndex, setActiveTooltipIndex] = useState(-1);

  const { data, error, isLoading, mutate } = useSWR(
    QueryKey.ALLOCATORS_DATACAP_USAGE_INFO,
    fetchDatacapUsageInfo,
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

  const handlePieEnter = useCallback<NonNullable<PieProps["onMouseEnter"]>>(
    (_data, index) => {
      setActiveTooltipIndex(() => index);
    },
    []
  );

  const handlePieLeave = useCallback<
    NonNullable<PieProps["onMouseLeave"]>
  >(() => {
    setActiveTooltipIndex(() => -1);
  }, []);

  const formatBytes = useCallback(
    (input: string | bigint | number | Array<string | number>) => {
      if (Array.isArray(input)) {
        return String(input);
      }

      return filesize(input, { standard: "iec" });
    },
    []
  );

  const renderTooltip = useCallback(
    (props: TooltipContentProps<ValueType, NameType>) => {
      const payload = props?.payload?.[0]?.payload;
      if (!payload) {
        return <></>;
      }
      const { label, value } = payload;

      return (
        <Card key={props?.payload?.length}>
          <CardHeader className="pb-2">
            <CardTitle>{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{formatBytes(value)}</p>
          </CardContent>
        </Card>
      );
    },
    [formatBytes]
  );

  const chartData = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        label: "Allocated",
        value: Number(BigInt(data.usedDatacap.value)),
      },
      {
        label: "Available",
        value: Number(BigInt(data.remainingDatacap.value)),
      },
    ];
  }, [data]);

  const totalDatacap = data
    ? BigInt(data.usedDatacap.value) + BigInt(data.remainingDatacap.value)
    : 0n;
  const summaryItems = [
    ["Used DataCap Allowance", data?.usedDatacap],
    ["Remaining DataCap Allowance", data?.remainingDatacap],
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>DataCap Allocation</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row lg:flex-col items-center justify-center relative">
        {!isLoading && !chartData && <p>Error loading data</p>}
        {chartData && (
          <ResponsiveContainer width={"100%"} aspect={1} debounce={100}>
            <PieChart>
              <Pie
                isAnimationActive={false}
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={"70%"}
                innerRadius={"65%"}
                fill="#8884d8"
                dataKey="value"
                activeShape={ActiveShapeSimple}
                onMouseEnter={handlePieEnter}
                onMouseLeave={handlePieLeave}
              >
                <Cell fill={palette(0)} />
                <Cell fill="#E7E7E7" />
              </Pie>
              <foreignObject
                x="calc(50% - 75px)"
                y="calc(50% - 75px)"
                width="150"
                height="150"
              >
                <div className="flex flex-col items-center justify-center w-[150px] h-[150px]">
                  {data ? (
                    <p className="text-3xl">{formatBytes(totalDatacap)}</p>
                  ) : (
                    <Skeleton className="w-[90px] h-9" />
                  )}
                  <p className="text-xs text-muted-foreground">Total DataCap</p>
                </div>
              </foreignObject>
              <Tooltip
                content={renderTooltip}
                formatter={formatBytes}
                active
                defaultIndex={0}
              />
              <Tooltip
                content={() => null}
                defaultIndex={activeTooltipIndex}
                active={activeTooltipIndex !== -1}
              />
            </PieChart>
          </ResponsiveContainer>
        )}

        <div className="flex flex-col gap-4 w-full">
          {summaryItems.map(([label, entry], index) => (
            <div key={index} className="flex items-start justify-between gap-2">
              <div className="flex gap-2 items-center">
                <div
                  className={cn(
                    "w-[10px] h-[10px] bg-dodger-blue rounded-full",
                    index !== 0 && "bg-[#E7E7E7]"
                  )}
                />
                <p className="text-sm">{label}</p>
              </div>
              <div className="flex flex-col items-end">
                {entry ? (
                  <p className="text-sm">{formatBytes(entry.value)}</p>
                ) : (
                  <Skeleton className="w-[50px] h-[14px] my-[3px]" />
                )}

                {entry ? (
                  <p className="text-xs text-muted-foreground">
                    {percentageFormatter.format(entry.percentage)}
                  </p>
                ) : (
                  <Skeleton className="w-[50px] h-[16px] my-[2px]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
