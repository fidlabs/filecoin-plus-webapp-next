"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, palette } from "@/lib/utils";
import { type Week, weekToReadableString, weekToString } from "@/lib/weeks";
import { scaleSymlog } from "d3-scale";
import { filesize } from "filesize";
import { CheckIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { ChartXAxisTick } from "./chart-x-axis-tick";

export interface DatacapOverTimeByAllocatorChartProps {
  data: Array<{
    allocatorId: string;
    allocatorName: string;
    entries: Array<{
      week: Week;
      datacap: bigint;
    }>;
  }>;
  scale?: "linear" | "log";
}

type DataItem = DatacapOverTimeByAllocatorChartProps["data"][number];

function getWeekColor(week: Week): string {
  return palette(week.year * 100 + week.weekNumber);
}

export function DatacapOverTimeByAllocatorChart({
  data,
  scale = "linear",
}: DatacapOverTimeByAllocatorChartProps) {
  const [selectedWeekStrings, setSelectedWeekStrings] = useState<string[]>([]);

  const weeks = useMemo<Week[]>(() => {
    return data
      .flatMap((dataItem) => {
        return dataItem.entries.map((entry) => {
          return entry.week;
        });
      })
      .filter((item, index, array) => {
        return (
          array.findIndex(
            (comparedItem) =>
              comparedItem.weekNumber === item.weekNumber &&
              comparedItem.year === item.year
          ) === index
        );
      })
      .toSorted((a, b) => {
        return b.year * 100 + b.weekNumber - (a.year * 100 + a.weekNumber);
      });
  }, [data]);

  const minValue = useMemo(() => {
    const sortedValues = data
      .map((item) => {
        if (selectedWeekStrings.length > 0) {
          const weekEntry = item.entries.find((entry) =>
            selectedWeekStrings.includes(weekToString(entry.week))
          );

          return weekEntry ? Number(weekEntry.datacap) : 0;
        }

        return item.entries.reduce(
          (sum, entry) => sum + entry.datacap,
          BigInt(0)
        );
      })
      .toSorted((a, b) => {
        if (a === b) {
          return 0;
        }

        return a > b ? 1 : -1;
      });

    return !sortedValues[0] || sortedValues[0] < BigInt(1)
      ? 1
      : Number(sortedValues[0]);
  }, [data, selectedWeekStrings]);

  const formatYAxisTick = useCallback((value: string) => {
    return filesize(value, { standard: "iec" });
  }, []);

  const getXAxisDataKey = useCallback((dataItem: DataItem) => {
    return dataItem.allocatorName;
  }, []);

  const totalDatacapAccessor = useCallback(
    (dataItem: DataItem) => {
      if (selectedWeekStrings.length > 0) {
        const weekEntry = dataItem.entries.find((entry) =>
          selectedWeekStrings.includes(weekToString(entry.week))
        );
        return weekEntry && weekEntry.datacap > BigInt(0)
          ? Number(weekEntry.datacap)
          : null;
      }

      return Number(
        dataItem.entries.reduce((total, entry) => {
          return total + entry.datacap;
        }, BigInt(0))
      );
    },
    [selectedWeekStrings]
  );

  const createWeekDatacapAccessor = useCallback((weekString: string) => {
    return (dataItem: DataItem) => {
      const entry = dataItem.entries.find((entry) => {
        return weekToString(entry.week) === weekString;
      });

      if (!entry) {
        return 0;
      }

      return Number(entry.datacap);
    };
  }, []);

  const renderTooltip = useCallback(
    (tooltipProps: TooltipProps<number, string>) => {
      return (
        <CustomTooltip
          {...tooltipProps}
          selectedWeekStrings={selectedWeekStrings}
        />
      );
    },
    [selectedWeekStrings]
  );

  const handleSelectWeek = useCallback((nextWeekString: string) => {
    setSelectedWeekStrings((currentSelectedWeekStrings) => {
      const index = currentSelectedWeekStrings.findIndex(
        (candidateWeekString) => candidateWeekString === nextWeekString
      );

      if (index === -1) {
        return [...currentSelectedWeekStrings, nextWeekString];
      }

      return currentSelectedWeekStrings.toSpliced(index, 1);
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedWeekStrings([]);
  }, []);

  const handleBarClick = useCallback(
    (_barData: unknown, index: number) => {
      const item = data[index];

      if (item) {
        window.open(`/allocators/${item.allocatorId}`, "_blank");
      }
    },
    [data]
  );

  return (
    <div className="w-full flex gap-4">
      <ResponsiveContainer width="100%" height={630} debounce={500}>
        <BarChart
          data={data}
          margin={{
            bottom: 100,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={getXAxisDataKey}
            tick={<ChartXAxisTick />}
            angle={90}
            interval={0}
            minTickGap={0}
          />
          <YAxis
            tickFormatter={formatYAxisTick}
            scale={scale === "log" ? scaleSymlog().constant(minValue) : scale}
            fontSize={14}
          />
          <Tooltip content={renderTooltip} />=
          <Bar
            dataKey={totalDatacapAccessor}
            hide={selectedWeekStrings.length > 0}
            fill="#0091ff"
            style={{
              stroke: "#212121",
              strokeWidth: 1,
              cursor: "pointer",
            }}
            onClick={handleBarClick}
          />
          {weeks.map((week) => {
            const weekString = weekToString(week);

            return (
              <Bar
                key={weekString}
                dataKey={createWeekDatacapAccessor(weekString)}
                stackId="a"
                hide={!selectedWeekStrings.includes(weekString)}
                fill={getWeekColor(week)}
                name={weekToReadableString(week)}
                style={{
                  stroke: "#212121",
                  strokeWidth: 1,
                  cursor: "pointer",
                }}
                onClick={handleBarClick}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>

      <WeeksList
        items={weeks}
        selectedWeekStrings={selectedWeekStrings}
        onSelectWeek={handleSelectWeek}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  selectedWeekStrings: string[];
}

function CustomTooltip({
  label,
  payload,
  selectedWeekStrings,
}: CustomTooltipProps) {
  const dataItem: DataItem = payload?.[0]?.payload;

  if (!dataItem) {
    return null;
  }

  const visibleEntries =
    selectedWeekStrings.length > 0
      ? dataItem.entries.filter((entry) => {
          return selectedWeekStrings.includes(weekToString(entry.week));
        })
      : dataItem.entries;

  if (visibleEntries.length === 0) {
    return null;
  }

  const total = visibleEntries.reduce(
    (sum, entry) => sum + entry.datacap,
    BigInt(0)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {label} - {filesize(total, { standard: "iec" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {visibleEntries
          .toSorted((a, b) => {
            return Number(b.datacap - a.datacap);
          })
          .map((entry) => {
            const entryWeekString = weekToString(entry.week);

            return (
              <div
                key={entryWeekString}
                className="flex flex-row items-center justify-start gap-1 text-sm text-muted-foreground"
              >
                <div
                  className="w-[10px] h-[10px] rounded-full"
                  style={{
                    backgroundColor: getWeekColor(entry.week),
                  }}
                />
                <p className="leading-none">
                  {weekToReadableString(entry.week)}:{" "}
                  {filesize(entry.datacap, { standard: "iec" })}
                </p>
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}

interface WeeksListProps {
  items: Week[];
  selectedWeekStrings: string[];
  onClearSelection(): void;
  onSelectWeek(weekString: string): void;
}

function WeeksList({
  items,
  selectedWeekStrings,
  onClearSelection,
  onSelectWeek,
}: WeeksListProps) {
  return (
    <div className="w-[200px] max-h-[600px] flex flex-col justify-between">
      <h5 className="text-sm font-semibold mb-2">Filter by Weeks</h5>
      <ul className="flex-1 my-3 overflow-y-auto">
        {items.map((week) => {
          const weekString = weekToString(week);

          return (
            <WeeksListItem
              key={weekString}
              color={getWeekColor(week)}
              label={`Week ${week.weekNumber}, ${week.year}`}
              selected={selectedWeekStrings.includes(weekString)}
              value={weekString}
              onSelect={onSelectWeek}
            />
          );
        })}
      </ul>

      <Button
        className="w-full"
        onClick={onClearSelection}
        disabled={selectedWeekStrings.length === 0}
      >
        Clear Selection
        {selectedWeekStrings.length > 0 && ` (${selectedWeekStrings.length})`}
      </Button>
    </div>
  );
}

interface WeeksListItemProps {
  color: string;
  label: string;
  selected: boolean;
  value: string;
  onSelect(value: string): void;
}

function WeeksListItem({
  color,
  label,
  selected,
  value,
  onSelect,
}: WeeksListItemProps) {
  const handleClick = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);

  return (
    <li
      className={"flex items-center text-sm gap-2 pr-2 py-1 cursor-pointer"}
      onClick={handleClick}
    >
      <div
        className="w-3 h-3 m-w-3 rounded"
        style={{ backgroundColor: color }}
      />
      <p className="flex-1 truncate">{label}</p>
      <CheckIcon
        className={cn(
          "ml-auto h-4 w-4 text-muted-foreground",
          selected ? "opacity-100" : "opacity-0"
        )}
      />
    </li>
  );
}
