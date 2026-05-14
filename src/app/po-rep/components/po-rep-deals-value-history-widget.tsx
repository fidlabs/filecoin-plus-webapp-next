"use client";

import { ChartStat } from "@/components/chart-stat";
import { OverlayLoader } from "@/components/overlay-loader";
import { Card } from "@/components/ui/card";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import useSWR from "swr";
import {
  fetchPoRepDealsValueHistory,
  type FetchPoRepDealsValueHistoryParameters,
} from "../po-rep-data";
import { CumulativeChartWithVolume } from "./cumulative-chart-with-volume";
import {
  HistoricalChartWindowSizeSelect,
  type HistoricalChartWindowSizeSelectProps,
} from "./historical-chart-window-size-select";

type WindowSize = HistoricalChartWindowSizeSelectProps["windowSize"];
type CardProps = ComponentProps<typeof Card>;
export type PoRepDealsValueHistoryWidgetProps = Omit<CardProps, "children">;

const numericFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  notation: "compact",
});

const unit = "USD";
const syncId = "po-rep-deals-value-history-charts";

const volumeWindowLabelDict: Record<WindowSize, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
};

export function PoRepDealsValueHistoryWidget(
  props: PoRepDealsValueHistoryWidgetProps
) {
  const [windowSize, setWindowSize] = useState<WindowSize>("day");
  const parameters: FetchPoRepDealsValueHistoryParameters = {
    windowSize,
  };
  const { data, error, isLoading, mutate } = useSWR(
    [QueryKey.PO_REP_DEALS_VALUE_HISTORY, parameters],
    ([, fetchParameters]) => {
      return fetchPoRepDealsValueHistory(fetchParameters);
    },
    {
      keepPreviousData: true,
      revalidateOnMount: false,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  useEffect(() => {
    if (!data && !error && !isLoading) {
      mutate();
    }
  }, [data, error, isLoading, mutate]);

  const chartData = useMemo(() => {
    return data ?? [];
  }, [data]);

  const formatValue = useCallback((value: number) => {
    return numericFormatter.format(value) + ` ${unit}`;
  }, []);

  const {
    cumulativeAmount,
    cumulativeAmountChange,
    currentWindowAmount,
    currentWindowAmountChange,
  } = useMemo<{
    cumulativeAmount: string;
    cumulativeAmountChange: number | undefined;
    currentWindowAmount: string;
    currentWindowAmountChange: number | undefined;
  }>(() => {
    const currentEntry = chartData.at(-1);

    if (!currentEntry) {
      return {
        cumulativeAmount: "N/A",
        cumulativeAmountChange: undefined,
        currentWindowAmount: "N/A",
        currentWindowAmountChange: undefined,
      };
    }

    const previousEntry = chartData.at(-2);

    if (!previousEntry) {
      return {
        cumulativeAmount: formatValue(currentEntry.cumulativeTotalUSD),
        cumulativeAmountChange: undefined,
        currentWindowAmount: formatValue(currentEntry.volumeUSD),
        currentWindowAmountChange: undefined,
      };
    }

    const cumulativeAmountChange =
      previousEntry.cumulativeTotalUSD === 0
        ? undefined
        : currentEntry.cumulativeTotalUSD / previousEntry.cumulativeTotalUSD -
          1;
    const currentDailyAmountChange =
      previousEntry.volumeUSD === 0
        ? undefined
        : currentEntry.volumeUSD / previousEntry.volumeUSD - 1;

    return {
      cumulativeAmount: formatValue(currentEntry.cumulativeTotalUSD),
      cumulativeAmountChange,
      currentWindowAmount: formatValue(currentEntry.volumeUSD),
      currentWindowAmountChange: currentDailyAmountChange,
    };
  }, [chartData, formatValue]);

  return (
    <Card {...props}>
      <header className="px-4 pt-6 mb-4 flex flex-wrap gap-2 justify-between">
        <div>
          <h3 className="text-lg font-medium">Deals Value</h3>
          <p className="text-xs text-muted-foreground">
            Total USD value locked in accepted deals, assuming they will not be
            terminated early
          </p>
        </div>

        <HistoricalChartWindowSizeSelect
          windowSize={windowSize}
          onWindowSizeChange={setWindowSize}
        />
      </header>

      <div className="px-4 mb-6 flex flex-wrap gap-x-8 gap-y-2">
        <ChartStat
          label="Cumulative Total"
          value={cumulativeAmount}
          percentageChange={cumulativeAmountChange}
        />

        <ChartStat
          label={`${volumeWindowLabelDict[windowSize]} Volume`}
          value={currentWindowAmount}
          percentageChange={currentWindowAmountChange}
        />
      </div>

      <div className="relative">
        <CumulativeChartWithVolume
          data={chartData}
          dateKey="date"
          cumulativeKey="cumulativeTotalUSD"
          volumeKey="volumeUSD"
          syncId={syncId}
          windowSize={windowSize}
          formatValue={formatValue}
        />
        <OverlayLoader show={isLongLoading} />
      </div>
    </Card>
  );
}
