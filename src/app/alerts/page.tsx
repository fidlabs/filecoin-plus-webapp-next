import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type AllocatorsDailyReportChecksResponse,
  fetchAllocatorsDailyReportChecks,
  fetchAllocatorsReportChecksDays,
  fetchAllocatorsReportChecksWeeks,
} from "@/lib/api";
import { safeWeekFromString, type Week, weekToUTCDate } from "@/lib/weeks";
import { UTCDate } from "@date-fns/utc";
import { AlertsList } from "./components/alerts-list";
import { type ChecksChartProps } from "./components/checks-chart";
import { DailyChecksChart } from "./components/daily-checks-chart";
import { WeeklyChecksChart } from "./components/weekly-checks-chart";

export const revalidate = 300;

interface PageProps {
  searchParams: Record<string, string | void>;
}

type ChartDataItem = ChecksChartProps["data"][number];
interface PageData {
  chartData: ChartDataItem[];
  alertsData: AllocatorsDailyReportChecksResponse;
}

function safeDayFromString(input: unknown): string | undefined {
  if (typeof input !== "string") {
    return undefined;
  }

  const date = new UTCDate(input);

  if (isNaN(date.valueOf())) {
    return undefined;
  }

  return date.toISOString();
}

async function loadChartData(
  maybeWeek: Week | undefined
): Promise<PageData["chartData"]> {
  if (maybeWeek) {
    const daysResponse = await fetchAllocatorsReportChecksDays(
      weekToUTCDate(maybeWeek).toISOString()
    );

    return daysResponse.results.toReversed().map<ChartDataItem>((result) => {
      return {
        date: result.day,
        passed: result.checksPassedCount,
        failed: result.checksFailedCount,
      };
    });
  }

  const weeksResponse = await fetchAllocatorsReportChecksWeeks();

  return weeksResponse.toReversed().map<ChartDataItem>((result) => {
    return {
      date: result.week,
      passed: result.checksPassedCount,
      failed: result.checksFailedCount,
    };
  });
}

async function loadPageData(
  searchParams: PageProps["searchParams"]
): Promise<PageData> {
  const maybeWeek = safeWeekFromString(searchParams.week);
  const maybeDay = safeDayFromString(searchParams.date);
  const [chartData, alertsData] = await Promise.all([
    loadChartData(maybeWeek),
    fetchAllocatorsDailyReportChecks(maybeDay),
  ]);

  return {
    chartData,
    alertsData,
  };
}

export default async function AlertsPage({ searchParams }: PageProps) {
  const { alertsData, chartData } = await loadPageData(searchParams);
  const maybeSelectedWeek = safeWeekFromString(searchParams.week);

  return (
    <div className="flex flex-col gap-12">
      <Card>
        <CardHeader className="flex-col items-start">
          <CardTitle>Alerts Over Time</CardTitle>
          <CardDescription>
            Use charts below to see alerts for specific date.
          </CardDescription>
        </CardHeader>
        {maybeSelectedWeek ? (
          <DailyChecksChart data={chartData} week={maybeSelectedWeek} />
        ) : (
          <WeeklyChecksChart data={chartData} />
        )}
      </Card>

      <AlertsList data={alertsData} />
    </div>
  );
}
