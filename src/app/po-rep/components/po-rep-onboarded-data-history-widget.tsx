"use client";

import { ChartStat } from "@/components/chart-stat";
import { Card } from "@/components/ui/card";
import { fetchPoRepOnboardedDataHistory } from "@/lib/cdp";
import { QueryKey } from "@/lib/constants";
import { createFetcherHook } from "@/lib/data-loading";
import { divideBigint } from "@/lib/utils";
import { filesize } from "filesize";
import { useCallback, useMemo, useState, type ComponentProps } from "react";
import {
  HistoricalChartWindowSizeSelect,
  type HistoricalChartWindowSizeSelectProps,
} from "./historical-chart-window-size-select";
import { PoRepOnboardedDataHistoryChart } from "./po-rep-onboarded-data-history-chart";

type WindowSize = HistoricalChartWindowSizeSelectProps["windowSize"];
type CardProps = ComponentProps<typeof Card>;
export type PoRepOnboardedDataHistoryWidgetProps = Omit<CardProps, "children">;

const volumeWindowLabelDict: Record<WindowSize, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
};

const useHistory = createFetcherHook(
  fetchPoRepOnboardedDataHistory,
  QueryKey.PO_REP_ONBOARDED_DATA_HISTORY
);

export function PoRepOnboardedDataHistoryWidget(
  props: PoRepOnboardedDataHistoryWidgetProps
) {
  const [windowSize, setWindowSize] = useState<WindowSize>("day");
  const { data } = useHistory({ windowSize }, { keepPreviousData: true });

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

      <PoRepOnboardedDataHistoryChart windowSize={windowSize} />
    </Card>
  );
}
