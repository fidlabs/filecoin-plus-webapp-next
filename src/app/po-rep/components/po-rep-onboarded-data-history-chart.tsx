"use client";

import { OverlayLoader } from "@/components/overlay-loader";
import { fetchPoRepOnboardedDataHistory } from "@/lib/cdp";
import { QueryKey } from "@/lib/constants";
import { createFetcherHook } from "@/lib/data-loading";
import { type F0IdInput } from "@/lib/f0-id";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { filesize } from "filesize";
import { type HTMLAttributes, useCallback, useMemo } from "react";
import { CumulativeChartWithVolume } from "./cumulative-chart-with-volume";
import { cn } from "@/lib/utils";

type WindowSize = "day" | "week" | "month";
export interface PoRepOnboardedDataHistoryChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  providerId?: F0IdInput;
  windowSize?: WindowSize;
}

const syncId = "po-rep-onbarded-data-history-charts";

const useHistory = createFetcherHook(
  fetchPoRepOnboardedDataHistory,
  QueryKey.PO_REP_ONBOARDED_DATA_HISTORY
);

export function PoRepOnboardedDataHistoryChart({
  className,
  providerId,
  windowSize = "day",
  ...rest
}: PoRepOnboardedDataHistoryChartProps) {
  const { data, error, isLoading } = useHistory(
    { providerId, windowSize },
    { keepPreviousData: true }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const chartData = useMemo(() => {
    return data
      ? data.map((entry) => ({
          date: entry.date,
          volume: Number(BigInt(entry.volume)),
          cumulativeTotal: Number(BigInt(entry.cumulativeTotal)),
        }))
      : [];
  }, [data]);

  const formatBytes = useCallback((value: bigint | number) => {
    return filesize(value, { standard: "iec" });
  }, []);

  return (
    <div {...rest} className={cn("relative", className)}>
      {!!error && (
        <p className="text-sm text-muted-foreground text-center">
          An error has occured while loading the data. Please try again later.
        </p>
      )}

      {!error && (
        <CumulativeChartWithVolume
          data={chartData}
          dateKey="date"
          cumulativeKey="cumulativeTotal"
          volumeKey="volume"
          syncId={syncId}
          windowSize={windowSize}
          formatValue={formatBytes}
          formatYAxisTick={formatBytes}
        />
      )}

      <OverlayLoader show={isLongLoading} />
    </div>
  );
}
