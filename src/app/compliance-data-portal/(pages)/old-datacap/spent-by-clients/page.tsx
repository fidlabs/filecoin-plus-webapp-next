import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { fetchClientsOldDatacap, getClients } from "@/lib/api";
import { dateToYearWeek } from "@/lib/utils";
import { filesize } from "filesize";
import {
  OldDatacapBreakdownChart,
  OldDatacapBreakdownChartProps,
} from "../components/old-datacap-breakdown-chart";

type ChartData = OldDatacapBreakdownChartProps["chartData"];
type Drilldown = OldDatacapBreakdownChartProps["drilldown"];

interface SpentTotal {
  label: string;
  value: bigint;
}

interface PageData {
  chartData: ChartData;
  drilldown: Drilldown;
  spentTotal: SpentTotal;
}

async function loadChartData(): Promise<PageData> {
  const [oldDatacapData, clientsData] = await Promise.all([
    fetchClientsOldDatacap(),
    getClients({
      page: "1",
      pageSize: "10000",
      showInactive: "true",
    }),
  ]);

  const spentTotal = oldDatacapData.results.reduce<SpentTotal>(
    (total, item, index, results) => {
      const value = total.value + BigInt(item.claims);
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
      allocations: Number(item.claims),
      allocationsName: "Old Datacap Spent by Clients",
    };
  });

  const drilldown: Drilldown = oldDatacapData.results.reduce((result, item) => {
    return {
      ...result,
      [dateToYearWeek(item.week)]: item.drilldown
        .filter((drilldownItem) => drilldownItem.claims !== "0")
        .map((drilldownItem) => {
          const client = clientsData.data.find(
            (candidate) => candidate.addressId === drilldownItem.client
          );
          const name =
            client && client.name && client.name.length > 0
              ? client.name
              : drilldownItem.client;

          return {
            id: drilldownItem.client,
            name,
            value: drilldownItem.claims,
          };
        }),
    };
  }, {});

  return {
    spentTotal,
    chartData,
    drilldown,
  };
}

export default async function OldDatacapSpentByClientsPage() {
  const { chartData, drilldown, spentTotal } = await loadChartData();

  return (
    <ChartWrapper
      title="Old Datacap Spent by Clients"
      id="OldDatacapSpentByClients"
      addons={[
        {
          name: spentTotal.label,
          value: filesize(spentTotal.value, { standard: "iec" }),
        },
      ]}
    >
      <OldDatacapBreakdownChart
        chartData={chartData}
        drilldown={drilldown}
        drilldownItemLabel="Old Datacap Spent: "
        variant="client"
      />
    </ChartWrapper>
  );
}
