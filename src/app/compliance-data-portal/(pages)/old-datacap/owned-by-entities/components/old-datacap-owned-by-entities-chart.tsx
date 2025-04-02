"use client";

import {
  OldDatacapBreakdownChart,
  OldDatacapBreakdownChartProps,
} from "../../components/old-datacap-breakdown-chart";
import { OldDatacapChartWrapper } from "../../components/old-datacap-chart-wrapper";

export type OldDatacapOwnedByEntitiesChartProps = Pick<
  OldDatacapBreakdownChartProps,
  "chartData" | "drilldown"
>;

export function OldDatacapOwnedByEntitiesChart({
  chartData,
  drilldown,
}: OldDatacapOwnedByEntitiesChartProps) {
  return (
    <OldDatacapChartWrapper
      title="Old Datacap Owned by Entities"
      id="OldDatacapOwnedByEntities"
      addons={[
        {
          name: "What's here?",
          size: 3,
          value: (
            <p>
              A chart showing how much &quot;Old Datacap&quot; is owned by
              entites over time, with a per entitity breakdown for each week.
            </p>
          ),
        },
      ]}
      renderContent={({ scale }) => (
        <>
          <p className="text-sm text-center text-muted-foreground mb-4">
            Click on the bar to see which entities
          </p>
          <OldDatacapBreakdownChart
            chartData={chartData}
            drilldown={drilldown}
            drilldownItemLabel="Old Datacap Owned: "
            variant="allocator"
            scale={scale}
          />
        </>
      )}
    />
  );
}
