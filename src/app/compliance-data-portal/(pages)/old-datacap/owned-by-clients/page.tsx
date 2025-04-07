import { fetchClientsOldDatacap } from "@/lib/api";
import { dateToYearWeek } from "@/lib/utils";
import {
  OldDatacapOwnedByClientsChart,
  OldDatacapOwnedByClientsChartProps,
} from "./components/old-datacap-owned-by-clients-chart";

async function loadChartData(): Promise<
  OldDatacapOwnedByClientsChartProps["chartData"]
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

  return <OldDatacapOwnedByClientsChart chartData={chartData} />;
}
