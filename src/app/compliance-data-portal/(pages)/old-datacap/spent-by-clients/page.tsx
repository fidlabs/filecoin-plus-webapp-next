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
    oldDatacapOwned: Number(item.claims),
    oldDatacapOwnedName: "Old Datacap Spent by Clients",
  }));
}

export default async function OldDatacapSpentByClientsPage() {
  const chartData = await loadChartData();

  return (
    <ChartWrapper
      title="Old Datacap Spent by Clients"
      id="OldDatacapSpentByClients"
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
