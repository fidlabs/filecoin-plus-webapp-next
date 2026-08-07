"use client";

import { HistoricalChartWindowSizeSelect } from "@/app/po-rep/components/historical-chart-window-size-select";
import { Card } from "@/components/ui/card";
import { F0IdInput } from "@/lib/f0-id";
import { cn } from "@/lib/utils";
import { type HTMLAttributes, useState } from "react";
import {
  PoRepOnboardedDataHistoryChart,
  PoRepOnboardedDataHistoryChartProps,
} from "../../../components/po-rep-onboarded-data-history-chart";
import { PoRepProviderStorageStatisticsGrid } from "./po-rep-provider-storage-statistics-grid";
import { ProviderDealsStorageTable } from "./provider-deals-storage-table";

type WindowSize = NonNullable<
  PoRepOnboardedDataHistoryChartProps["windowSize"]
>;

export interface PoRepProviderStorageWidgetProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  providerId: F0IdInput;
}

export function PoRepProviderStorageWidget({
  className,
  providerId,
  ...rest
}: PoRepProviderStorageWidgetProps) {
  const [windowSize, setWindowSize] = useState<WindowSize>("day");

  return (
    <Card {...rest} className={cn("pt-6", className)}>
      <header className="mb-6 px-4">
        <h3 className="text-lg font-semibold">Storage</h3>
        <p className="text-sm text-muted-foreground">
          Provider&apos;s storage breakdown
        </p>
      </header>

      <section className="mb-6 px-4">
        <h4 className="text-sm font-semibold mb-2 uppercase">Deals</h4>
        <PoRepProviderStorageStatisticsGrid providerId={providerId} />
      </section>

      <section className="mb-6">
        <div className="px-4 mb-4 flex flex-wrap justify-between item-center gap-2">
          <h4 className="text-sm font-semibold uppercase">
            Onboarded Data History
          </h4>

          <HistoricalChartWindowSizeSelect
            windowSize={windowSize}
            onWindowSizeChange={setWindowSize}
          />
        </div>
        <PoRepOnboardedDataHistoryChart
          providerId={providerId}
          windowSize={windowSize}
        />
      </section>

      <ProviderDealsStorageTable providerId={providerId} />
    </Card>
  );
}
