"use client";

import { ChartStat } from "@/components/chart-stat";
import { Card } from "@/components/ui/card";
import { QueryKey } from "@/lib/constants";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import useSWR from "swr";
import {
  fetchPoRepPaymentsHistory,
  type FetchPoRepPaymentsHistoryParameters,
} from "../po-rep-data";
import { CumulativeChartWithVolume } from "./cumulative-chart-with-volume";
import {
  HistoricalChartWindowSizeSelect,
  type HistoricalChartWindowSizeSelectProps,
} from "./historical-chart-window-size-select";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { OverlayLoader } from "@/components/overlay-loader";

type WindowSize = HistoricalChartWindowSizeSelectProps["windowSize"];
type CardProps = ComponentProps<typeof Card>;
export type PoRepMoneyFlowWidgetProps = Omit<CardProps, "children">;

const numericFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  notation: "compact",
});

const unit = "USD";
const syncId = "po-rep-money-flow-charts";

const volumeWindowLabelDict: Record<WindowSize, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
};

export function PoRepMoneyFlowWidget(props: PoRepMoneyFlowWidgetProps) {
  const [windowSize, setWindowSize] = useState<WindowSize>("day");
  const parameters: FetchPoRepPaymentsHistoryParameters = {
    windowSize,
  };
  const { data, error, isLoading, mutate } = useSWR(
    [QueryKey.PO_REP_PAYMENTS_HISTORY, parameters],
    ([, fetchParameters]) => {
      return fetchPoRepPaymentsHistory(fetchParameters);
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
        cumulativeAmount: formatValue(currentEntry.cumulativeAmountUSD),
        cumulativeAmountChange: undefined,
        currentWindowAmount: formatValue(currentEntry.dailyAmountUSD),
        currentWindowAmountChange: undefined,
      };
    }

    const cumulativeAmountChange =
      previousEntry.cumulativeAmountUSD === 0
        ? undefined
        : currentEntry.cumulativeAmountUSD / previousEntry.cumulativeAmountUSD -
          1;
    const currentDailyAmountChange =
      previousEntry.dailyAmountUSD === 0
        ? undefined
        : currentEntry.dailyAmountUSD / previousEntry.dailyAmountUSD - 1;

    return {
      cumulativeAmount: formatValue(currentEntry.cumulativeAmountUSD),
      cumulativeAmountChange,
      currentWindowAmount: formatValue(currentEntry.dailyAmountUSD),
      currentWindowAmountChange: currentDailyAmountChange,
    };
  }, [chartData, formatValue]);

  return (
    <Card {...props}>
      <header className="px-4 pt-6 mb-4 flex flex-wrap gap-2 justify-between">
        <div>
          <h3 className="text-lg font-medium">Money Flow</h3>
          <p className="text-xs text-muted-foreground">
            Total amount of USD that has flown to the SPs for fullfilling their
            deals
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
          cumulativeKey="cumulativeAmountUSD"
          volumeKey="dailyAmountUSD"
          syncId={syncId}
          windowSize={windowSize}
          formatValue={formatValue}
        />
        <OverlayLoader show={isLongLoading} />
      </div>
    </Card>
  );
}
