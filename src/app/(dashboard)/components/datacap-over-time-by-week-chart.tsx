"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, stringToColor } from "@/lib/utils";
import { Week, weekToReadableString } from "@/lib/weeks";
import { scaleSymlog } from "d3-scale";
import { filesize } from "filesize";
import { CheckIcon, SearchIcon } from "lucide-react";
import { ChangeEventHandler, useCallback, useMemo, useState } from "react";
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

export interface DatacapOverTimeByWeekChartProps {
  data: Array<{
    week: Week;
    entries: Array<{
      allocatorId: string;
      allocatorName: string;
      datacap: bigint;
    }>;
  }>;
  scale?: "linear" | "log";
}

type DataItem = DatacapOverTimeByWeekChartProps["data"][number];
type Allocator = Pick<
  DataItem["entries"][number],
  "allocatorId" | "allocatorName"
> & {
  color: string;
};

export function DatacapOverTimeByWeekChart({
  data,
  scale = "linear",
}: DatacapOverTimeByWeekChartProps) {
  const [selectedAllocatorIds, setSelectedAllocatorsIds] = useState<string[]>(
    []
  );

  const allocators = useMemo<Allocator[]>(() => {
    return data
      .flatMap((dataItem) => {
        return dataItem.entries.map((entry) => {
          return {
            allocatorId: entry.allocatorId,
            allocatorName: entry.allocatorName,
            color: stringToColor(entry.allocatorName),
          };
        });
      })
      .filter((item, index, array) => {
        return (
          array.findIndex(
            (comparedItem) => comparedItem.allocatorId === item.allocatorId
          ) === index
        );
      });
  }, [data]);

  const minValue = useMemo(() => {
    const sortedValues = data
      .map((item) => {
        const includedEntries =
          selectedAllocatorIds.length > 0
            ? item.entries.filter((entry) =>
                selectedAllocatorIds.includes(entry.allocatorId)
              )
            : item.entries;

        return includedEntries.reduce(
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
  }, [data, selectedAllocatorIds]);

  const formatYAxisTick = useCallback((value: string) => {
    return filesize(value, { standard: "iec" });
  }, []);

  const getXAxisDataKey = useCallback((dataItem: DataItem) => {
    return weekToReadableString(dataItem.week);
  }, []);

  const totalDatacapAccessor = useCallback(
    (dataItem: DataItem) => {
      const includedEntries =
        selectedAllocatorIds.length > 0
          ? dataItem.entries.filter((entry) =>
              selectedAllocatorIds.includes(entry.allocatorId)
            )
          : dataItem.entries;

      return Number(
        includedEntries.reduce((total, entry) => {
          return total + entry.datacap;
        }, BigInt(0))
      );
    },
    [selectedAllocatorIds]
  );

  const createAllocatorDatacapAccessor = useCallback((allocatorId: string) => {
    return (dataItem: DataItem) => {
      const allocatorEntry = dataItem.entries.find((entry) => {
        return entry.allocatorId === allocatorId;
      });

      return Number(allocatorEntry?.datacap ?? 0);
    };
  }, []);

  const renderTooltip = useCallback(
    (tooltipProps: TooltipProps<number, string>) => {
      return (
        <CustomTooltip
          {...tooltipProps}
          selectedAllocatorIds={selectedAllocatorIds}
        />
      );
    },
    [selectedAllocatorIds]
  );

  const handleSelectAllocatorId = useCallback(
    (nextSelectedAllocatorId: string) => {
      setSelectedAllocatorsIds((currentSelectedAllocatorIds) => {
        const index = currentSelectedAllocatorIds.findIndex(
          (candidateId) => candidateId === nextSelectedAllocatorId
        );

        if (index === -1) {
          return [...currentSelectedAllocatorIds, nextSelectedAllocatorId];
        }

        return currentSelectedAllocatorIds.toSpliced(index, 1);
      });
    },
    []
  );

  const handleClearSelection = useCallback(() => {
    setSelectedAllocatorsIds([]);
  }, []);

  return (
    <div className="w-full flex gap-4">
      <ResponsiveContainer width="100%" height={600} debounce={500}>
        <BarChart
          data={data}
          margin={{
            bottom: 30,
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
          />
          <Tooltip content={renderTooltip} />=
          <Bar
            dataKey={totalDatacapAccessor}
            hide={selectedAllocatorIds.length > 0}
            fill="#0091ff"
            style={{
              stroke: "#212121",
              strokeWidth: 1,
            }}
          />
          {allocators.map((allocator) => (
            <Bar
              key={allocator.allocatorId}
              dataKey={createAllocatorDatacapAccessor(allocator.allocatorId)}
              hide={!selectedAllocatorIds.includes(allocator.allocatorId)}
              fill={allocator.color}
              name={allocator.allocatorName}
              style={{
                stroke: "#212121",
                strokeWidth: 1,
              }}
              stackId="a"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <AllocatorsList
        items={allocators}
        selectedAllocatorIds={selectedAllocatorIds}
        onSelectAllocatorId={handleSelectAllocatorId}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  selectedAllocatorIds: string[];
}

function CustomTooltip({
  label,
  payload,
  selectedAllocatorIds,
}: CustomTooltipProps) {
  const dataItem: DataItem = payload?.[0]?.payload;

  if (!dataItem) {
    return null;
  }

  const visibleEntries =
    selectedAllocatorIds.length > 0
      ? dataItem.entries.filter((entry) =>
          selectedAllocatorIds.includes(entry.allocatorId)
        )
      : dataItem.entries;

  if (visibleEntries.length === 0) {
    return null;
  }

  const total =
    payload?.[0].value ??
    visibleEntries.reduce((sum, entry) => sum + entry.datacap, BigInt(0));

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
            return (
              <div
                key={entry.allocatorId}
                className="flex flex-row items-center justify-start gap-1 text-sm text-muted-foreground"
              >
                <div
                  className="w-[10px] h-[10px] rounded-full"
                  style={{
                    backgroundColor: stringToColor(entry.allocatorName),
                  }}
                />
                <p className="leading-none">
                  {entry.allocatorName}:{" "}
                  {filesize(entry.datacap, { standard: "iec" })}
                </p>
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}

interface AllocatorsListProps {
  items: Allocator[];
  selectedAllocatorIds: string[];
  onClearSelection(): void;
  onSelectAllocatorId(allocatorId: string): void;
}

function AllocatorsList({
  items,
  selectedAllocatorIds,
  onClearSelection,
  onSelectAllocatorId,
}: AllocatorsListProps) {
  const [searchPhrase, setSearchPhrase] = useState("");

  const isItemActive = useCallback(
    (item: Allocator) => {
      return [
        item.allocatorId.toLowerCase(),
        item.allocatorName.toLowerCase(),
      ].some((text) => text.includes(searchPhrase.toLowerCase()));
    },
    [searchPhrase]
  );

  const sortedItems =
    searchPhrase.length > 0
      ? items.toSorted((a, b) => {
          const aActive = isItemActive(a);
          const bActive = isItemActive(b);

          if (aActive && bActive) {
            return 0;
          }

          return aActive ? -1 : 1;
        })
      : items;

  const handleSearchPhraseChange = useCallback<
    ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setSearchPhrase(event.target.value);
  }, []);

  return (
    <div className="max-w-[200px] max-h-[600px] flex flex-col justify-between">
      <h5 className="text-sm font-semibold mb-2">Filter by Allocators</h5>
      <div className="flex items-center border p-1 rounded">
        <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          className="h-6 rounded-md bg-transparent border-none py-3 text-sm outline-none placeholder:text-muted-foreground"
          value={searchPhrase}
          placeholder="Search Allocator..."
          onChange={handleSearchPhraseChange}
        />
      </div>
      <ul className="flex-1 overflow-y-auto my-3">
        {sortedItems.map((item) => (
          <AllocatorsListItem
            key={item.allocatorId}
            active={isItemActive(item)}
            color={item.color}
            label={item.allocatorName}
            selected={selectedAllocatorIds.includes(item.allocatorId)}
            value={item.allocatorId}
            onSelect={onSelectAllocatorId}
          />
        ))}
      </ul>
      <Button
        className="w-full"
        onClick={onClearSelection}
        disabled={selectedAllocatorIds.length === 0}
      >
        Clear Selection
        {selectedAllocatorIds.length > 0 && ` (${selectedAllocatorIds.length})`}
      </Button>
    </div>
  );
}

interface AllocatorsListItemProps {
  active: boolean;
  color: string;
  label: string;
  selected: boolean;
  value: string;
  onSelect(value: string): void;
}

function AllocatorsListItem({
  active,
  color,
  label,
  selected,
  value,
  onSelect,
}: AllocatorsListItemProps) {
  const handleClick = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);

  return (
    <li
      className={cn(
        "flex items-center text-sm gap-2 pr-2 py-1 cursor-pointer opacity-50",
        active && "opacity-100"
      )}
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
