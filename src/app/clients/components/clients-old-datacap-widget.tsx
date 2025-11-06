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
import { type CategoricalChartFunc } from "recharts/types/chart/types";
import { type ScaleType } from "recharts/types/util/types";
import useSWR from "swr";
import {
  fetchClientsOldDatacap,
  type FetchClientsOldDatacapReturnType,
} from "../clients-data";

type CardProps = ComponentProps<typeof Card>;

export interface ClientsOldDatacapWidgetProps
  extends Omit<CardProps, "children"> {
  animationDuration?: number;
}

interface ChartEntry {
  date: string;
  datacapOwned: number;
  datacapSpent: number;
}

type Result = FetchClientsOldDatacapReturnType["results"][number];

const scales = ["symlog", "linear"] as const satisfies ScaleType[];
const scalesLabelDict: Record<(typeof scales)[number], string> = {
  symlog: "Log",
  linear: "Linear",
};

export function ClientsOldDatacapWidget({
  animationDuration = 200,
  ...rest
}: ClientsOldDatacapWidgetProps) {
  const [scale, setScale] = useState<string>(scales[0]);
  const [activeResult, setActiveResult] = useState<Result>();
  const { data, isLoading } = useSWR(
    QueryKey.CLIENTS_OLD_DATACAP,
    () => fetchClientsOldDatacap(),
    {
      keepPreviousData: true,
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
        datacapSpent: Number(result.claims),
      };
    });
  }, [data]);

  const [totalSpentValue, totalSpentLabel] = useMemo<
    [string | null, string]
  >(() => {
    const defaultLabel = "Total spent";

    if (!data) {
      return [null, defaultLabel];
    }

    if (data.results.length === 0) {
      return ["0B", defaultLabel];
    }

    if (data.results.length === 1) {
      return [
        filesize(data.results[0].claims, { standard: "iec" }),
        defaultLabel,
      ];
    }

    const startWeek = weekFromDate(data.results[0].week);
    const endWeek = weekFromDate(data.results[data.results.length - 1].week);
    const totalAllocatedBytes = data.results.reduce((sum, result) => {
      return sum + BigInt(result.claims);
    }, 0n);

    return [
      filesize(totalAllocatedBytes, { standard: "iec" }),
      `Total spent from ${weekToReadableString(startWeek)} - ${weekToReadableString(endWeek)}`,
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
          Track &quot;old datacap&quot; owned and spent by clients over time.
          Hover and click on chart to see breakdown for a specific week.
        </p>
      </header>

      <div className="p-4 flex flex-wrap items-end justify-between gap-4ąś">
        <ChartStat value={totalSpentValue} label={totalSpentLabel} />

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
                dataKey="datacapSpent"
                name="Old Datacap Spent"
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

  const drilldown = activeResult?.drilldown;
  const drilldownSorted = useMemo(() => {
    if (!drilldown) {
      return [];
    }

    return drilldown
      .filter((item) => {
        const value = mode === "owned" ? item.oldDatacap : item.claims;
        return value !== "0";
      })
      .toSorted((a, b) => {
        const prop: keyof Result["drilldown"][number] =
          mode === "owned" ? "oldDatacap" : "claims";
        const aValue = BigInt(a[prop]);
        const bValue = BigInt(b[prop]);

        if (aValue === bValue) {
          return 0;
        }

        return aValue > bValue ? -1 : 1;
      });
  }, [drilldown, mode]);

  return (
    <Dialog open={!!activeResult} onOpenChange={handleDialogOpenChange}>
      {!!activeResult && (
        <DialogContent className="bg-white px-0">
          <DialogHeader className="px-6">
            <DialogTitle>
              {weekToReadableString(weekFromDate(activeResult.week))} Breakdown
            </DialogTitle>
            <DialogDescription>
              {activeResult.clients} clients
            </DialogDescription>

            <Tabs value={mode} onValueChange={setMode}>
              <TabsList className="w-full">
                <TabsTrigger className="flex-1" value="owned">
                  Owned
                </TabsTrigger>
                <TabsTrigger className="flex-1" value="spent">
                  Spent
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </DialogHeader>

          <div className="max-h-[500px] grid gap-2 px-6 overflow-y-auto overflow-x-hidden">
            {drilldownSorted.map((item) => {
              const value = mode === "owned" ? item.oldDatacap : item.claims;

              return (
                <div key={item.client}>
                  <Button
                    variant="link"
                    asChild
                    className="max-w-full truncate"
                  >
                    <Link href={`/clients/${item.client}`} target="_blank">
                      {item.clientName ?? item.client}
                    </Link>
                  </Button>
                  <p className="text-sm">
                    <span className="text-muted-foreground">
                      {mode === "owned"
                        ? "Old Datacap owned"
                        : "Old Datacap spent"}
                      :
                    </span>{" "}
                    {filesize(value, { standard: "iec" })}
                  </p>
                </div>
              );
            })}

            {drilldownSorted.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">
                Nothing to show
              </p>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
