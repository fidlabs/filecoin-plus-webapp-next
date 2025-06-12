"use client";

import { Button } from "@/components/ui/button";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { weekToReadableString, type Week } from "@/lib/weeks";
import { UTCDate } from "@date-fns/utc";
import { useCallback } from "react";
import { ChecksChart, type ChecksChartProps } from "./checks-chart";

export interface DailyChecksChartProps {
  data: ChecksChartProps["data"];
  week: Week;
}

type BarClickHandler = NonNullable<ChecksChartProps["onBarClick"]>;

export function DailyChecksChart({ data, week }: DailyChecksChartProps) {
  const { updateFilter } = useSearchParamsFilters();

  const handleResetButtonClick = useCallback(() => {
    updateFilter("week", undefined);
  }, [updateFilter]);

  const hanldeBarClick = useCallback<BarClickHandler>(
    (data) => {
      updateFilter("date", data.payload.date);
    },
    [updateFilter]
  );

  const formatDate = useCallback((date: string) => {
    return new UTCDate(date).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
    });
  }, []);

  return (
    <div className="pb-6">
      <div className="px-6 mb-4 flex flex-col items-center">
        <p className="text-sm text-center">
          Daily breakdown for {weekToReadableString(week)}
        </p>
        <Button variant="link" onClick={handleResetButtonClick}>
          Show all weeks
        </Button>
      </div>
      <ChecksChart
        data={data}
        formatDate={formatDate}
        onBarClick={hanldeBarClick}
      />
      <p className="text-sm text-center text-muted-foreground">
        Click on bar to show alerts for selected day.
      </p>
    </div>
  );
}
