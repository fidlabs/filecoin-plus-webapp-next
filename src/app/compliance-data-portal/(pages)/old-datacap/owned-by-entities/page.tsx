import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { fetchAllocatorsOldDatacap, getAllocators } from "@/lib/api";
import { dateToYearWeek } from "@/lib/utils";
import {
  OldDatacapBreakdownChart,
  OldDatacapBreakdownChartProps,
} from "../components/old-datacap-breakdown-chart";

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
      pageSize: "10000",
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
    <ChartWrapper
      title="Old Datacap Owned by Entities"
      id="OldDatacapOwnedByEntities"
    >
      <OldDatacapBreakdownChart
        chartData={chartData}
        drilldown={drilldown}
        drilldownItemLabel="Old Datacap Owned: "
        variant="allocator"
      />
      <p className="text-sm text-center text-muted-foreground">
        Click on bars to see per week breakdown
      </p>
    </ChartWrapper>
  );
}
