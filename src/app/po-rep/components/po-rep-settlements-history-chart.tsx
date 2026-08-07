"use client";

import { OverlayLoader } from "@/components/overlay-loader";
import { fetchPoRepSettlementsHistory } from "@/lib/cdp";
import { QueryKey } from "@/lib/constants";
import { createFetcherHook } from "@/lib/data-loading";
import { type F0IdInput } from "@/lib/f0-id";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { cn } from "@/lib/utils";
import { type HTMLAttributes, useCallback } from "react";
import { CumulativeChartWithVolume } from "./cumulative-chart-with-volume";

type WindowSize = "day" | "week" | "month";
export interface PoRepSettlementsHistoryChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  netAmounts?: boolean;
  providerId?: F0IdInput;
  windowSize?: WindowSize;
}

const syncId = "po-rep-settlements-history-charts";
const numericFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  notation: "compact",
});

const useHistory = createFetcherHook(
  fetchPoRepSettlementsHistory,
  QueryKey.PO_REP_SETTLEMENTS_HISTORY
);

export function PoRepSettlementsHistoryChart({
  className,
  netAmounts,
  providerId,
  windowSize = "day",
  ...rest
}: PoRepSettlementsHistoryChartProps) {
  const { data, error, isLoading } = useHistory(
    { netAmounts, providerId, windowSize },
    { keepPreviousData: true }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const formatValue = useCallback((value: number) => {
    return numericFormatter.format(value) + " USD";
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
          data={data ?? []}
          dateKey="date"
          cumulativeKey="cumulativeTotalUSD"
          volumeKey="volumeUSD"
          syncId={syncId}
          windowSize={windowSize}
          formatValue={formatValue}
        />
      )}

      <OverlayLoader show={isLongLoading} />
    </div>
  );
}
