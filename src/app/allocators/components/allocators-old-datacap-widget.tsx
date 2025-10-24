"use client";

import { ChartStat } from "@/components/chart-stat";
import { ChartTooltip } from "@/components/chart-tooltip";
import { OverlayLoader } from "@/components/overlay-loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { weekFromDate, weekToReadableString } from "@/lib/weeks";
import { filesize } from "filesize";
import Link from "next/link";
import { useCallback, useMemo, useState, type ComponentProps } from "react";
import {
  Area,
  Bar,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CategoricalChartFunc } from "recharts/types/chart/types";
import { type ScaleType } from "recharts/types/util/types";
import useSWR from "swr";
import {
  fetchAllocatorsOldDatacap,
  FetchAllocatorsOldDatacapReturnType,
} from "../allocators-data";

type CardProps = ComponentProps<typeof Card>;

export interface AllocatorsOldDatacapWidgetProps
  extends Omit<CardProps, "children"> {
  animationDuration?: number;
}

interface ChartEntry {
  date: string;
  datacapOwned: number;
  datacapAllocated: number;
}

type Result = FetchAllocatorsOldDatacapReturnType["results"][number];

const scales = ["symlog", "linear"] as const satisfies ScaleType[];
const scalesLabelDict: Record<(typeof scales)[number], string> = {
  symlog: "Log",
  linear: "Linear",
};

export function AllocatorsOldDatacapWidget({
  animationDuration = 200,
  ...rest
}: AllocatorsOldDatacapWidgetProps) {
  const [scale, setScale] = useState<string>(scales[0]);
  const [activeResult, setActiveResult] = useState<Result>();
  const { data, isLoading } = useSWR(
    QueryKey.ALLOCATORS_OLD_DATACAP,
    () => fetchAllocatorsOldDatacap(),
    {
      keepPreviousData: true,
      revalidateOnMount: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 1000);

  const chartData = useMemo<ChartEntry[]>(() => {
    if (!data) {
      return [];
    }

    return data.results.map<ChartEntry>((result) => {
      return {
        date: result.week,
        datacapOwned: Number(result.oldDatacap),
        datacapAllocated: Number(result.allocations),
      };
    });
  }, [data]);

  const [totalAllocationValue, totalAllocationLabel] = useMemo<
    [string | null, string]
  >(() => {
    if (!data) {
      return [null, "Total allocated"];
    }

    const startWeek = weekFromDate(data.results[0].week);
    const endWeek = weekFromDate(data.results[data.results.length - 1].week);
    const totalAllocatedBytes = data.results.reduce((sum, result) => {
      return sum + BigInt(result.allocations);
    }, 0n);

    return [
      filesize(totalAllocatedBytes, { standard: "iec" }),
      `Total allocated from ${weekToReadableString(startWeek)} - ${weekToReadableString(endWeek)}`,
    ];
  }, [data]);

  const formatWeek = useCallback((value: string) => {
    return weekToReadableString(weekFromDate(value));
  }, []);

  const formatDatacap = useCallback((value: string | number) => {
    return filesize(value, { standard: "iec" });
  }, []);

  const handleChartClick = useCallback<CategoricalChartFunc>(
    (state) => {
      if (!data || !state.activeLabel) {
        return;
      }

      const nextActiveResult = data.results.find((result) => {
        return result.week === state.activeLabel;
      });

      setActiveResult(nextActiveResult);
    },
    [data]
  );

  const handleDrilldownDialogClose = useCallback(() => {
    setActiveResult(undefined);
  }, []);

  return (
    <Card {...rest}>
      <header className="p-4">
        <h3 className="text-lg font-medium">Old Datacap</h3>
        <p className="text-xs text-muted-foreground">
          Track &quot;old datacap&quot; owned by entities and allocated to
          clients over time. Hover and click on chart to see breakdown for a
          specific week.
        </p>
      </header>

      <div className="p-4 flex flex-wrap items-end justify-between gap-4ąś">
        <ChartStat value={totalAllocationValue} label={totalAllocationLabel} />

        <Tabs value={scale} onValueChange={setScale}>
          <TabsList>
            {scales.map((possibleScale) => (
              <TabsTrigger key={possibleScale} value={possibleScale}>
                {scalesLabelDict[possibleScale]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="relative p-4 mb-4 min-h-[300px]">
        <ResponsiveContainer width="100%" height={300} debounce={200}>
          <ComposedChart data={chartData} onClick={handleChartClick}>
            <XAxis dataKey="date" tickFormatter={formatWeek} fontSize={12} />
            <YAxis
              width="auto"
              tickFormatter={formatDatacap}
              fontSize={12}
              scale={scale as ScaleType}
            />
            <g className="cursor-pointer">
              <Area
                type="monotone"
                dataKey="datacapOwned"
                name="Old Datacap Owned"
                animationDuration={animationDuration}
                scale={scale}
                fill="hsl(var(--color-dodger-blue))"
                fillOpacity={0.3}
                stroke="hsl(var(--color-dodger-blue))"
              />
              <Bar
                dataKey="datacapAllocated"
                name="Old Datacap Allocated"
                animationDuration={animationDuration}
                scale={scale}
                fill="var(--color-link)"
              />
            </g>
            <Tooltip
              content={ChartTooltip}
              labelFormatter={formatWeek}
              formatter={formatDatacap}
            />
            <Legend
              wrapperStyle={{
                fontSize: 12,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <OverlayLoader show={!data || isLongLoading} />
      </div>

      <DrilldownDialog
        activeResult={activeResult}
        onClose={handleDrilldownDialogClose}
      />
    </Card>
  );
}

interface DrilldownDialogProps {
  activeResult: Result | undefined;
  onClose(): void;
}

function DrilldownDialog({ activeResult, onClose }: DrilldownDialogProps) {
  const [mode, setMode] = useState("owned");

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog open={!!activeResult} onOpenChange={handleDialogOpenChange}>
      {!!activeResult && (
        <DialogContent className="bg-white px-0">
          <DialogHeader className="px-6">
            <DialogTitle>
              {weekToReadableString(weekFromDate(activeResult.week))} Breakdown
            </DialogTitle>
            <DialogDescription>
              {activeResult.allocators} entities
            </DialogDescription>

            <Tabs value={mode} onValueChange={setMode}>
              <TabsList className="w-full">
                <TabsTrigger className="flex-1" value="owned">
                  Owned
                </TabsTrigger>
                <TabsTrigger className="flex-1" value="allocated">
                  Allocated
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </DialogHeader>

          <div className="max-h-[500px] grid gap-2 px-6 overflow-y-auto overflow-x-hidden">
            {activeResult.drilldown.map((item) => {
              const value =
                mode === "owned" ? item.oldDatacap : item.allocations;

              if (value === "0") {
                return null;
              }

              return (
                <div key={item.allocator}>
                  <Button
                    variant="link"
                    asChild
                    className="max-w-full truncate"
                  >
                    <Link
                      href={`/allocators/${item.allocator}`}
                      target="_blank"
                    >
                      {item.allocator}
                    </Link>
                  </Button>
                  <p className="text-sm">
                    <span className="text-muted-foreground">
                      {mode === "owned"
                        ? "Old Datacap owned"
                        : "Old Datacap allocated"}
                      :
                    </span>{" "}
                    {filesize(value, { standard: "iec" })}
                  </p>
                </div>
              );
            })}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
