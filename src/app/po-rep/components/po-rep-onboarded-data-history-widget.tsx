"use client";

import { ChartStat } from "@/components/chart-stat";
import { OverlayLoader } from "@/components/overlay-loader";
import { Card } from "@/components/ui/card";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { divideBigint } from "@/lib/utils";
import { filesize } from "filesize";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import useSWR from "swr";
import {
  fetchPoRepOnboardedDataHistory,
  type FetchPoRepOnboardedDataHistoryParameters,
} from "../po-rep-data";
import { CumulativeChartWithVolume } from "./cumulative-chart-with-volume";
import {
  HistoricalChartWindowSizeSelect,
  type HistoricalChartWindowSizeSelectProps,
} from "./historical-chart-window-size-select";

type WindowSize = HistoricalChartWindowSizeSelectProps["windowSize"];
type CardProps = ComponentProps<typeof Card>;
export type PoRepOnboardedDataHistoryWidgetProps = Omit<CardProps, "children">;

const syncId = "po-rep-onbarded-data-history-charts";

const volumeWindowLabelDict: Record<WindowSize, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
};

export function PoRepOnboardedDataHistoryWidget(
  props: PoRepOnboardedDataHistoryWidgetProps
) {
  const [windowSize, setWindowSize] = useState<WindowSize>("day");
  const parameters: FetchPoRepOnboardedDataHistoryParameters = {
    windowSize,
  };
  const { data, error, isLoading, mutate } = useSWR(
    [QueryKey.PO_REP_ONBOARDED_DATA_HISTORY, parameters],
    ([, fetchParameters]) => {
      return fetchPoRepOnboardedDataHistory(fetchParameters);
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
    const currentEntryCumulativeTotalBN = BigInt(currentEntry.cumulativeTotal);
    const currentEntryVolumeBN = BigInt(currentEntry.volume);

    if (!previousEntry) {
      return {
        cumulativeAmount: formatBytes(currentEntryCumulativeTotalBN),
        cumulativeAmountChange: undefined,
        currentWindowAmount: formatBytes(currentEntryVolumeBN),
        currentWindowAmountChange: undefined,
      };
    }

    const previousEntryCumulativeTotalBN = BigInt(
      previousEntry.cumulativeTotal
    );
    const previousEntryVolumeBN = BigInt(previousEntry.volume);
    const cumulativeAmountChange =
      previousEntryCumulativeTotalBN === 0n
        ? undefined
        : divideBigint(
            currentEntryCumulativeTotalBN,
            previousEntryCumulativeTotalBN,
            2
          ) - 1;
    const currentDailyAmountChange =
      previousEntryVolumeBN === 0n
        ? undefined
        : divideBigint(currentEntryVolumeBN, previousEntryVolumeBN, 2) - 1;

    return {
      cumulativeAmount: formatBytes(currentEntryCumulativeTotalBN),
      cumulativeAmountChange,
      currentWindowAmount: formatBytes(currentEntryVolumeBN),
      currentWindowAmountChange: currentDailyAmountChange,
    };
  }, [chartData, formatBytes]);

  return (
    <Card {...props}>
      <header className="px-4 pt-6 mb-4 flex flex-wrap gap-2 justify-between">
        <div>
          <h3 className="text-lg font-medium">Onboarded Data</h3>
          <p className="text-xs text-muted-foreground">
            Cumulative total and volume of deal&apos;s data onboarded by
            providers
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
          label={`Latest ${volumeWindowLabelDict[windowSize]} Volume`}
          value={currentWindowAmount}
          percentageChange={currentWindowAmountChange}
        />
      </div>

      <div className="relative">
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
        <OverlayLoader show={isLongLoading} />
      </div>
    </Card>
  );
}
