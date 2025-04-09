import { fetchIPNIMisreportingHistoricalData } from "@/lib/api";
import {
  IPNIMisreportingHistoricalChart,
  IPNIMisreportingHistoricalChartProps,
} from "./components/ipni-misreporting-historical-chart";
import { dateToYearWeek } from "@/lib/utils";

type ChartData = IPNIMisreportingHistoricalChartProps["data"];

async function loadChartData(): Promise<ChartData> {
  const apiData = await fetchIPNIMisreportingHistoricalData();

  const chartData: ChartData = apiData.results.map((item) => {
    return {
      name: dateToYearWeek(item.week),
      notReporting: item.notReporting,
      notReportingName: "IPNI Not Reporting",
      misreporting: item.misreporting,
      misreportingName: "IPNI Misreporting",

      ok: item.ok,
      okName: "IPNI OK",
    };
  });

  return chartData;
}

export default async function IPNIMisreportingPage() {
  const chartData = await loadChartData();

  return <IPNIMisreportingHistoricalChart data={chartData} />;
}
