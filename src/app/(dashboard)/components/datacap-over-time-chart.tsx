"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScaleSelector } from "@/components/ui/scale-selector";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IAllocatorsResponse } from "@/lib/interfaces/dmob/allocator.interface";
import { IFilDCAllocationsWeeklyByClient } from "@/lib/interfaces/dmob/dmob.interface";
import { useMemo, useState } from "react";
import {
  DatacapOverTimeByAllocatorChart,
  DatacapOverTimeByAllocatorChartProps,
} from "./datacap-over-time-by-allocator-chart";
import {
  DatacapOverTimeByWeekChart,
  DatacapOverTimeByWeekChartProps,
} from "./datacap-over-time-by-week-chart";

interface Props {
  data: IFilDCAllocationsWeeklyByClient;
  allocators: IAllocatorsResponse;
}

function findAllocatorName(
  allocators: IAllocatorsResponse,
  allocatorId: string
): string {
  const matchingAllocator = allocators.data.find(
    (candidate) => candidate.addressId === allocatorId
  );

  const maybeName = matchingAllocator?.name ?? matchingAllocator?.orgName;

  if (!maybeName || maybeName.length === 0) {
    return allocatorId;
  }

  return maybeName;
}

export function DatacapOverTimeChart({ data, allocators }: Props) {
  const [mode, setMode] = useState("week");
  const [scale, setScale] = useState<"linear" | "log">("linear");

  const dataByWeek = useMemo(() => {
    type Data = DatacapOverTimeByWeekChartProps["data"];
    type WeekEntries = Data[number]["entries"];

    return Object.entries(data).flatMap(([yearString, yearData]) => {
      const year = parseInt(yearString, 10);

      return Object.entries(yearData).reduce<Data>(
        (items, [weekString, weekData]) => {
          const weekNumber = parseInt(weekString, 10);
          const entries: WeekEntries = Object.entries(weekData)
            .reduce<WeekEntries>((entries, [allocatorId, bytesString]) => {
              return [
                ...entries,
                {
                  allocatorId,
                  allocatorName: findAllocatorName(allocators, allocatorId),
                  datacap: BigInt(bytesString),
                },
              ];
            }, [])
            .toSorted((a, b) => (b.datacap > a.datacap ? -1 : 1));

          return [
            ...items,
            {
              week: {
                year,
                weekNumber,
              },
              entries,
            },
          ];
        },
        []
      );
    });
  }, [allocators, data]);

  const dataByAllocator = useMemo(() => {
    type Data = DatacapOverTimeByAllocatorChartProps["data"];
    type AllocatorEntries = Data[number]["entries"];
    type AllocatorDatacapMap = Record<string, AllocatorEntries>;

    const datacapMap = Object.entries(data).reduce<AllocatorDatacapMap>(
      (datacapMap, [yearString, yearData]) => {
        const year = parseInt(yearString, 10);

        return Object.entries(yearData).reduce<AllocatorDatacapMap>(
          (yearDatacapMap, [weekString, weekData]) => {
            const weekNumber = parseInt(weekString, 10);

            return Object.entries(weekData).reduce<AllocatorDatacapMap>(
              (weekDatacapMap, [allocatorId, bytesString]) => {
                const allocatorEntries = weekDatacapMap[allocatorId] ?? [];

                return {
                  ...weekDatacapMap,
                  [allocatorId]: [
                    ...allocatorEntries,
                    {
                      week: {
                        weekNumber,
                        year,
                      },
                      datacap: BigInt(bytesString),
                    },
                  ],
                };
              },
              yearDatacapMap
            );
          },
          datacapMap
        );
      },
      {}
    );

    return Object.entries(datacapMap).map<Data[number]>(
      ([allocatorId, entries]) => {
        return {
          allocatorId,
          allocatorName: findAllocatorName(allocators, allocatorId),
          entries,
        };
      }
    );
  }, [allocators, data]);

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
