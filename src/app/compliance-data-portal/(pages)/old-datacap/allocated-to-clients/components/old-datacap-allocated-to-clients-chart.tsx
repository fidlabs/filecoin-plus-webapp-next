"use client";

import { filesize } from "filesize";
import {
  OldDatacapBreakdownChart,
  OldDatacapBreakdownChartProps,
} from "../../components/old-datacap-breakdown-chart";
import { OldDatacapChartWrapper } from "../../components/old-datacap-chart-wrapper";

export type OldDatacapAllocatedToClientsChartProps = Pick<
  OldDatacapBreakdownChartProps,
  "chartData" | "drilldown"
> & {
  allocationsTotal: {
    label: string;
    value: bigint;
  };
};

export function OldDatacapAllocatedToClientsChart({
  allocationsTotal,
  chartData,
  drilldown,
}: OldDatacapAllocatedToClientsChartProps) {
  return (
    <OldDatacapChartWrapper
      title="Old Datacap Allocated to Clients"
      id="OldDatacapAllocatedToClients"
      addons={[
        {
          name: "What's here?",
          size: 2,
          value: (
            <p>
              A chart showing how much &quot;Old Datacap&quot; was allocated to
              clients each week, with a per entitity breakdown for each week.
            </p>
          ),
        },
        {
          name: allocationsTotal.label,
          value: filesize(allocationsTotal.value, { standard: "iec" }),
        },
      ]}
      renderContent={({ scale }) => (
        <>
          <p className="text-sm text-center text-muted-foreground mb-4">
            Click on the bar to see which entites
          </p>
          <OldDatacapBreakdownChart
            chartData={chartData}
            drilldown={drilldown}
            drilldownItemLabel="Old Datacap Allocated to Clients: "
            variant="allocator"
            scale={scale}
          />
        </>
      )}
    />
  );
}
