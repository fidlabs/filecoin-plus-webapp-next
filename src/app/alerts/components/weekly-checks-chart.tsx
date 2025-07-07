"use client";

import { Button } from "@/components/ui/button";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { cn } from "@/lib/utils";
import { weekFromDate, weekToReadableString, weekToString } from "@/lib/weeks";
import { chunk } from "lodash";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { ChecksChart, type ChecksChartProps } from "./checks-chart";

export interface WeeklyChecksChartProps {
  data: ChecksChartProps["data"];
}

type BarClickHandler = NonNullable<ChecksChartProps["onBarClick"]>;

const weeksChunkSize = 8;

export function WeeklyChecksChart({ data }: WeeklyChecksChartProps) {
  const { updateFilter } = useSearchParamsFilters();
  const [weeksChunkIndex, setWeeksChunkIndex] = useState(0);
  const weeksChunks = chunk(data, weeksChunkSize).toReversed();
  const weeksChunk = weeksChunks[weeksChunkIndex] ?? [];

  const prev = useCallback(() => {
    setWeeksChunkIndex((currentWeeksChunkIndex) => currentWeeksChunkIndex + 1);
  }, []);

  const next = useCallback(() => {
    setWeeksChunkIndex((currentWeeksChunkIndex) => currentWeeksChunkIndex - 1);
  }, []);

  const hanldeBarClick = useCallback<BarClickHandler>(
    (data) => {
      updateFilter("week", weekToString(weekFromDate(data.payload.date)));
    },
    [updateFilter]
  );

  const formatDate = useCallback((date: string) => {
    return weekToReadableString(weekFromDate(date));
  }, []);

  return (
    <div className="pb-6">
      {weeksChunks.length > 1 && (
        <div className="px-6 mb-4 flex justify-center items-center">
          <Button
            className={cn("w-6 h-6", {
              invisible: weeksChunkIndex === weeksChunks.length - 1,
            })}
            variant="ghost"
            size="icon"
            onClick={prev}
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <span className="text-sm text-center">
            {getWeeksChunksRangeText(weeksChunk)}
          </span>

          <Button
            className={cn("w-6 h-6", {
              invisible: weeksChunkIndex === 0,
            })}
            variant="ghost"
            size="icon"
            onClick={next}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      )}
      <ChecksChart
        data={weeksChunk}
        formatDate={formatDate}
        onBarClick={hanldeBarClick}
      />
      <p className="text-sm text-center text-muted-foreground">
        Click on bars to show breakdown for selected week.
      </p>
    </div>
  );
}

function getWeeksChunksRangeText(
  weeksChunk: WeeklyChecksChartProps["data"]
): string {
  if (weeksChunk.length === 0) {
    return "";
  }

  if (weeksChunk.length === 1) {
    return weekToReadableString(weekFromDate(weeksChunk[0].date));
  }

  return `${weekToReadableString(weekFromDate(weeksChunk[0].date))}-${weekToReadableString(weekFromDate(weeksChunk[weeksChunk.length - 1].date))}`;
}
