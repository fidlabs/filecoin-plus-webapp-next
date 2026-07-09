"use client";

import { HistoricalChartWindowSizeSelect } from "@/app/po-rep/components/historical-chart-window-size-select";
import { PoRepDealsRevenueHistoryChart } from "@/app/po-rep/components/po-rep-deals-revenue-history-chart";
import { PoRepSettlementsHistoryChart } from "@/app/po-rep/components/po-rep-settlements-history-chart";
import { Card } from "@/components/ui/card";
import { F0IdInput } from "@/lib/f0-id";
import { cn } from "@/lib/utils";
import { type HTMLAttributes, useCallback, useState } from "react";
import { PoRepOnboardedDataHistoryChartProps } from "../../../components/po-rep-onboarded-data-history-chart";
import { PoRepProviderEconomicsStatisticsGrid } from "./po-rep-provider-economics-statistics-grid";
import { ProviderDealsEconomicsTable } from "./provider-deals-economics-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type WindowSize = NonNullable<
  PoRepOnboardedDataHistoryChartProps["windowSize"]
>;

export interface PoRepProviderEconomicsWidgetProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  providerId: F0IdInput;
}

export function PoRepProviderEconomicsWidget({
  className,
  providerId,
  ...rest
}: PoRepProviderEconomicsWidgetProps) {
  const [netAmounts, setNetAmounts] = useState(false);
  const [windowSize, setWindowSize] = useState<WindowSize>("day");

  const handleAmountsTabChage = useCallback((value: string) => {
    setNetAmounts(value === "true");
  }, []);

  return (
    <Card {...rest} className={cn("pt-6", className)}>
      <header className="mb-6 px-4">
        <h3 className="text-lg font-semibold">Economics</h3>
        <p className="text-sm text-muted-foreground">
          Provider&apos;s Economics Breakdown
        </p>
      </header>

      <section className="pb-6 px-4 border-b">
        <h4 className="text-sm font-semibold mb-2 uppercase">Rails</h4>
        <PoRepProviderEconomicsStatisticsGrid providerId={providerId} />
      </section>

      <section className="py-6 border-b">
        <div className="px-4 mb-4 flex flex-wrap justify-between item-center gap-2">
          <h4 className="text-sm font-semibold uppercase">Revenue History</h4>

          <HistoricalChartWindowSizeSelect
            windowSize={windowSize}
            onWindowSizeChange={setWindowSize}
          />
        </div>
        <PoRepDealsRevenueHistoryChart
          providerId={providerId}
          windowSize={windowSize}
        />
      </section>

      <section className="py-6 border-b">
        <div className="px-4 mb-4 flex flex-wrap justify-between items-center gap-2">
          <h4 className="text-sm font-semibold uppercase">
            Settlements History
          </h4>

          <div className="flex flex-wrap items-center gap-2">
            <Tabs
              value={String(netAmounts)}
              onValueChange={handleAmountsTabChage}
            >
              <TabsList>
                <TabsTrigger value="false">Total Amount</TabsTrigger>
                <TabsTrigger value="true">Net Amount</TabsTrigger>
              </TabsList>
            </Tabs>
            <HistoricalChartWindowSizeSelect
              windowSize={windowSize}
              onWindowSizeChange={setWindowSize}
            />
          </div>
        </div>
        <PoRepSettlementsHistoryChart
          netAmounts={netAmounts}
          providerId={providerId}
          windowSize={windowSize}
        />
      </section>

      <ProviderDealsEconomicsTable providerId={providerId} />
    </Card>
  );
}
