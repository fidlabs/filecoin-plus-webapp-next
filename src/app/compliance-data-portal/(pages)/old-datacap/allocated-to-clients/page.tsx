import { fetchAllocatorsOldDatacap, getAllocators } from "@/lib/api";
import { dateToYearWeek } from "@/lib/utils";
import { OldDatacapBreakdownChartProps } from "../components/old-datacap-breakdown-chart";
import { OldDatacapAllocatedToClientsChart } from "./components/old-datacap-allocated-to-clients-chart";

type ChartData = OldDatacapBreakdownChartProps["chartData"];
type Drilldown = OldDatacapBreakdownChartProps["drilldown"];

interface AllocationsTotal {
  label: string;
  value: bigint;
}

interface PageData {
  allocationsTotal: AllocationsTotal;
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

  const allocationsTotal = oldDatacapData.results.reduce<AllocationsTotal>(
    (total, item, index, results) => {
      const value = total.value + BigInt(item.allocations);
      let label = total.label;

      if (index === 0) {
        label += dateToYearWeek(item.week);
      } else if (index === results.length - 1) {
        label += " to " + dateToYearWeek(item.week);
      }

      return {
        label,
        value,
      };
    },
    { label: "Total from ", value: BigInt(0) }
  );

  const chartData: ChartData = oldDatacapData.results.map((item) => {
    return {
      name: dateToYearWeek(item.week),
      allocations: Number(item.allocations),
      allocationsName: "Old Datacap Allocated to Clients",
    };
  });

  const drilldown: Drilldown = oldDatacapData.results.reduce((result, item) => {
    return {
      ...result,
      [dateToYearWeek(item.week)]: item.drilldown
        .filter((drilldownItem) => drilldownItem.allocations !== "0")
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
            value: drilldownItem.allocations,
          };
        }),
    };
  }, {});

  return {
    allocationsTotal,
    chartData,
    drilldown,
  };
}

export default async function OldDatacapAllocatedToClientsPage() {
  const { allocationsTotal, chartData, drilldown } = await loadPageData();

  return (
    <OldDatacapAllocatedToClientsChart
      allocationsTotal={allocationsTotal}
      chartData={chartData}
      drilldown={drilldown}
    />
  );
}
