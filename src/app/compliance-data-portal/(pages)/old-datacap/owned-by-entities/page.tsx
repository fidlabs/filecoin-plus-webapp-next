import { fetchAllocatorsOldDatacap, getAllocators } from "@/lib/api";
import { dateToYearWeek } from "@/lib/utils";
import { OldDatacapBreakdownChartProps } from "../components/old-datacap-breakdown-chart";
import { OldDatacapOwnedByEntitiesChart } from "./components/old-datacap-owned-by-entities-chart";

type ChartData = OldDatacapBreakdownChartProps["chartData"];
type Drilldown = OldDatacapBreakdownChartProps["drilldown"];

interface PageData {
  chartData: ChartData;
  drilldown: Drilldown;
}

async function loadPageData(): Promise<PageData> {
  const [oldDatacapData, allocatorsData] = await Promise.all([
    fetchAllocatorsOldDatacap(),
    getAllocators({
      page: "1",
      limit: "10000",
      showInactive: "true",
    }),
  ]);

  const chartData: ChartData = oldDatacapData.results.map((item) => {
    return {
      name: dateToYearWeek(item.week),
      oldDatacap: Number(item.oldDatacap),
      oldDatacapName: "Old Datacap Owned by Entities",
    };
  });

  const drilldown: Drilldown = oldDatacapData.results.reduce((result, item) => {
    return {
      ...result,
      [dateToYearWeek(item.week)]: item.drilldown
        .filter((drilldownItem) => drilldownItem.oldDatacap !== "0")
        .map((drilldownItem) => {
          const allocator = allocatorsData.data.find(
            (candidate) => candidate.addressId === drilldownItem.allocator
          );
          const name =
            allocator && allocator.name && allocator.name.length > 0
              ? allocator.name
              : drilldownItem.allocator;

          return {
            id: drilldownItem.allocator,
            name,
            value: drilldownItem.oldDatacap,
          };
        }),
    };
  }, {});

  return {
    chartData,
    drilldown,
  };
}

export default async function OldDatacapOwnedByAllocatorsPage() {
  const { chartData, drilldown } = await loadPageData();

  return (
    <OldDatacapOwnedByEntitiesChart
      chartData={chartData}
      drilldown={drilldown}
    />
  );
}
