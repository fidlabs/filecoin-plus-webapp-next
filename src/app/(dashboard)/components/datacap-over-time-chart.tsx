"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScaleSelector } from "@/components/ui/scale-selector";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryKey } from "@/lib/constants";
import { weekFromString, weekToString } from "@/lib/weeks";
import { groupBy } from "lodash";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { fetchAllocationsByAllocatorHistory } from "../dashboard-data";
import {
  DatacapOverTimeByAllocatorChart,
  type DatacapOverTimeByAllocatorChartProps,
} from "./datacap-over-time-by-allocator-chart";
import {
  DatacapOverTimeByWeekChart,
  type DatacapOverTimeByWeekChartProps,
} from "./datacap-over-time-by-week-chart";

export function DatacapOverTimeChart() {
  const [mode, setMode] = useState("week");
  const [scale, setScale] = useState<"linear" | "log">("linear");
  const { data, error, isLoading, mutate } = useSWR(
    QueryKey.ALLOCATORS_ALLOCATIONS_BY_ALLOCATOR_HISTORY,
    fetchAllocationsByAllocatorHistory,
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

  type ByWeekData = DatacapOverTimeByWeekChartProps["data"];

  const dataByWeek = useMemo<ByWeekData>(() => {
    if (!data) {
      return [];
    }

    const resultsGroupedByWeek = groupBy(data, (item) => {
      return weekToString({ year: item.year, weekNumber: item.week });
    });

    return Object.entries(resultsGroupedByWeek).map<ByWeekData[number]>(
      ([weekString, results]) => {
        const entries = results.map<ByWeekData[number]["entries"][number]>(
          (result) => {
            return {
              allocatorId: result.allocatorId,
              allocatorName: result.allocatorName ?? result.allocatorId,
              datacap: BigInt(result.weekTotal),
            };
          }
        );

        return {
          week: weekFromString(weekString),
          entries,
        };
      }
    );
  }, [data]);

  type ByAllocatorData = DatacapOverTimeByAllocatorChartProps["data"];

  const dataByAllocator = useMemo<ByAllocatorData>(() => {
    if (!data) {
      return [];
    }

    const glue = "_";
    const resultsGroupedByAllocator = groupBy(data, (item) => {
      return [item.allocatorId, item.allocatorName ?? item.allocatorId].join(
        glue
      );
    });

    return Object.entries(resultsGroupedByAllocator).map<
      ByAllocatorData[number]
    >(([allocatorString, results]) => {
      const [allocatorId, allocatorName] = allocatorString.split(glue);
      const entries = results.map<ByAllocatorData[number]["entries"][number]>(
        (entry) => {
          return {
            week: {
              year: entry.year,
              weekNumber: entry.week,
            },
            datacap: BigInt(entry.weekTotal),
          };
        }
      );

      return {
        allocatorId,
        allocatorName,
        entries,
      };
    });
  }, [data]);

  return (
    <Card className="hidden md:block md:col-span-3">
      <CardHeader>
        <CardTitle>DataCap Used Over Time by Allocator</CardTitle>
        <div className="flex gap-2">
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList>
              <TabsTrigger value="week">Week based</TabsTrigger>
              <TabsTrigger value="allocator">Allocator based</TabsTrigger>
            </TabsList>
          </Tabs>
          <ScaleSelector scale={scale} setScale={setScale} />
        </div>
      </CardHeader>
      <CardContent>
        {mode === "week" && (
          <DatacapOverTimeByWeekChart data={dataByWeek} scale={scale} />
        )}

        {mode === "allocator" && (
          <DatacapOverTimeByAllocatorChart
            data={dataByAllocator}
            scale={scale}
          />
        )}
      </CardContent>
    </Card>
  );
}
