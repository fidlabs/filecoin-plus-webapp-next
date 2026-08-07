"use client";

import { OverlayLoader } from "@/components/overlay-loader";
import { fetchPoRepDealsValueHistory } from "@/lib/cdp";
import { QueryKey } from "@/lib/constants";
import { createFetcherHook } from "@/lib/data-loading";
import { type F0IdInput } from "@/lib/f0-id";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { cn } from "@/lib/utils";
import { type HTMLAttributes, useCallback } from "react";
import { CumulativeChartWithVolume } from "./cumulative-chart-with-volume";

type WindowSize = "day" | "week" | "month";
export interface PoRepDealsRevenueHistoryChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  providerId?: F0IdInput;
  windowSize?: WindowSize;
}

const syncId = "po-rep-deals-revenue-history-charts";
const numericFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  notation: "compact",
});

const useHistory = createFetcherHook(
  fetchPoRepDealsValueHistory,
  QueryKey.PO_REP_DEALS_VALUE_HISTORY
);

export function PoRepDealsRevenueHistoryChart({
  className,
  providerId,
  windowSize = "day",
  ...rest
}: PoRepDealsRevenueHistoryChartProps) {
  const { data, error, isLoading } = useHistory(
    { providerId, windowSize },
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
