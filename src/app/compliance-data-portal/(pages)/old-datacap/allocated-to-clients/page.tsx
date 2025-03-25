import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { fetchAllocatorsOldDatacap, getAllocators } from "@/lib/api";
import { dateToYearWeek } from "@/lib/utils";
import { filesize } from "filesize";
import {
  AllocatorsOldDatacapBreakdownChart,
  AllocatorsOldDatacapBreakdownChartProps,
} from "../components/allocators-old-datacap-breakdown-chart";

type ChartData = AllocatorsOldDatacapBreakdownChartProps["chartData"];
type Drilldown = AllocatorsOldDatacapBreakdownChartProps["drilldown"];

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
    <ChartWrapper
      title="Old Datacap Allocated to Clients"
      id="OldDatacapAllocatedToClients"
      addons={[
        {
          name: allocationsTotal.label,
          value: filesize(allocationsTotal.value, { standard: "iec" }),
        },
      ]}
    >
      <AllocatorsOldDatacapBreakdownChart
        chartData={chartData}
        drilldown={drilldown}
        drilldownItemLabel="Old Datacap Allocated to Clients: "
      />
      <p className="text-sm text-center text-muted-foreground">
        Click on bars to see per week breakdown
      </p>
    </ChartWrapper>
  );
}
