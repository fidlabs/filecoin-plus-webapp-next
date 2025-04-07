"use client";

import { filesize } from "filesize";
import {
  OldDatacapBreakdownChart,
  OldDatacapBreakdownChartProps,
} from "../../components/old-datacap-breakdown-chart";
import { OldDatacapChartWrapper } from "../../components/old-datacap-chart-wrapper";

export type OldDatacapSpentByClientsChartProps = Pick<
  OldDatacapBreakdownChartProps,
  "chartData" | "drilldown"
> & {
  spentTotal: {
    label: string;
    value: bigint;
  };
};

export function OldDatacapSpentByClientsChart({
  chartData,
  drilldown,
  spentTotal,
}: OldDatacapSpentByClientsChartProps) {
  return (
    <OldDatacapChartWrapper
      title="Old Datacap Spent by Clients"
      id="OldDatacapSpentByClients"
      addons={[
        {
          name: "What's here?",
          size: 2,
          value: (
            <p>
              A chart showing how much &quot;Old Datacap&quot; was used by
              clients each week, with a per client breakdown for each week.
            </p>
          ),
        },
        {
          name: spentTotal.label,
          value: filesize(spentTotal.value, { standard: "iec" }),
        },
      ]}
      renderContent={({ scale }) => (
        <>
          <p className="text-sm text-center text-muted-foreground mb-4">
            Click on the bar to see which clients
          </p>
          <OldDatacapBreakdownChart
            chartData={chartData}
            drilldown={drilldown}
            drilldownItemLabel="Old Datacap Spent: "
            variant="client"
            scale={scale}
          />
        </>
      )}
    />
  );
}
