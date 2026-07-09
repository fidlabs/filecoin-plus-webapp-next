"use client";

import { ChartStat } from "@/components/chart-stat";
import { Card } from "@/components/ui/card";
import { fetchPoRepDealsValueHistory } from "@/lib/cdp";
import { QueryKey } from "@/lib/constants";
import { createFetcherHook } from "@/lib/data-loading";
import { useCallback, useMemo, useState, type ComponentProps } from "react";
import {
  HistoricalChartWindowSizeSelect,
  type HistoricalChartWindowSizeSelectProps,
} from "./historical-chart-window-size-select";
import { PoRepDealsRevenueHistoryChart } from "./po-rep-deals-revenue-history-chart";

type WindowSize = HistoricalChartWindowSizeSelectProps["windowSize"];
type CardProps = ComponentProps<typeof Card>;
export type PoRepDealsValueHistoryWidgetProps = Omit<CardProps, "children">;

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  useGrouping: true,
});

const volumeWindowLabelDict: Record<WindowSize, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
};

const useHistory = createFetcherHook(
  fetchPoRepDealsValueHistory,
  QueryKey.PO_REP_DEALS_VALUE_HISTORY
);

export function PoRepDealsValueHistoryWidget(
  props: PoRepDealsValueHistoryWidgetProps
) {
  const [windowSize, setWindowSize] = useState<WindowSize>("day");
  const { data } = useHistory({ windowSize }, { keepPreviousData: true });

  const chartData = useMemo(() => {
    return data ?? [];
  }, [data]);

  const formatValue = useCallback((value: number) => {
    return usdFormatter.format(value);
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
          <h3 className="text-lg font-medium">Predicted Revenue</h3>
          <p className="text-xs text-muted-foreground">
            Cumulative Total USD value locked in accepted deals, assuming they
            will not be terminated early.
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

      <PoRepDealsRevenueHistoryChart windowSize={windowSize} />
    </Card>
  );
}
