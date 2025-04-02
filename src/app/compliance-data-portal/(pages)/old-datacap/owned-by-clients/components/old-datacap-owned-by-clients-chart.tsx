"use client";

import { StackedBarGraph } from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import { OldDatacapBreakdownChartProps } from "../../components/old-datacap-breakdown-chart";
import { OldDatacapChartWrapper } from "../../components/old-datacap-chart-wrapper";

export type OldDatacapOwnedByClientsChartProps = Pick<
  OldDatacapBreakdownChartProps,
  "chartData"
>;

export function OldDatacapOwnedByClientsChart({
  chartData,
}: OldDatacapOwnedByClientsChartProps) {
  return (
    <OldDatacapChartWrapper
      title="Old Datacap Owned by Clients"
      id="OldDatacapOwnedByClients"
      addons={[
        {
          name: "What's here?",
          size: 3,
          value: (
            <p>
              A chart showing how much &quot;Old Datacap&quot; is owned by
              clients over time.
            </p>
          ),
        },
      ]}
      renderContent={({ scale }) => (
        <StackedBarGraph
          currentDataTab="PiB"
          data={chartData}
          isLoading={false}
          unit="PiB"
          scale={scale}
        />
      )}
    />
  );
}
