import { fetchIPNIMisreportingHistoricalData } from "@/lib/api";
import { dateToYearWeek } from "@/lib/utils";
import {
  IPNIMisreportingHistoricalChart,
  IPNIMisreportingHistoricalChartProps,
} from "./components/ipni-misreporting-historical-chart";

type ChartData = IPNIMisreportingHistoricalChartProps["data"];

async function loadChartData(roundId: string): Promise<ChartData> {
  const apiData = await fetchIPNIMisreportingHistoricalData(roundId);

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

export default async function IPNIMisreportingPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const roundId =
    (searchParams?.["roundId"] as string) ||
    process.env.NEXT_PUBLIC_DEFAULT_EDITION_ROUND_ID ||
    "6"; // Default to round 6 if not specified

  const chartData = await loadChartData(roundId);

  return <IPNIMisreportingHistoricalChart data={chartData} roundId={roundId} />;
}
