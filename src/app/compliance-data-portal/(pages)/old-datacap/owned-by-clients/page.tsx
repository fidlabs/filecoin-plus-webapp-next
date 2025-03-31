import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { StackedBarGraph } from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import { fetchClientsOldDatacap } from "@/lib/api";
import { dateToYearWeek } from "@/lib/utils";
import { ComponentProps } from "react";

async function loadChartData(): Promise<
  ComponentProps<typeof StackedBarGraph>["data"]
> {
  const data = await fetchClientsOldDatacap();

  return data.results.map((item) => ({
    name: dateToYearWeek(item.week),
    oldDatacapOwned: Number(item.oldDatacap),
    oldDatacapOwnedName: "Old Datacap Owned by Clients",
  }));
}

export default async function OldDatacapOwnedByClientsPage() {
  const chartData = await loadChartData();

  return (
    <ChartWrapper
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
    >
      <StackedBarGraph
        currentDataTab="PiB"
        data={chartData}
        isLoading={false}
        unit="PiB"
      />
    </ChartWrapper>
  );
}
