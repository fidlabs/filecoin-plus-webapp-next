import {
  fetchAllocatorsAuditTimesByMonth,
  fetchAllocatorsAuditTimesByRound,
} from "@/lib/api";
import {
  AuditTimeChart,
  AuditTimeChartProps,
} from "./components/audit-times-chart";

export const revalidate = 300;

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

interface PageData {
  chartDataByRound: AuditTimeChartProps["chartDataByRound"];
  chartDataByMonth: AuditTimeChartProps["chartDataByMonth"];
}

interface FetchPageDataParamters {
  editionId?: number;
}

async function fetchPageData({
  editionId,
}: FetchPageDataParamters): Promise<PageData> {
  const [auditTimesPerRound, auditTimesPerMonth] = await Promise.all([
    fetchAllocatorsAuditTimesByRound({ editionId: editionId?.toString() }),
    fetchAllocatorsAuditTimesByMonth({ editionId: editionId?.toString() }),
  ]);

  const roundsCount = Object.values(auditTimesPerRound).reduce(
    (max, values) => {
      return values === null ? max : Math.max(max, values.length);
    },
    0
  );

  const chartDataByRound: PageData["chartDataByRound"] = [
    ...Array(roundsCount),
  ].map((_, roundIndex) => {
    return {
      name: `Audit ${roundIndex + 1}`,
      averageAllocationTimeSecs:
        auditTimesPerRound.averageAllocationTimesSecs?.[roundIndex],
      averageAuditTimeSecs:
        auditTimesPerRound.averageAuditTimesSecs?.[roundIndex],
      averageConversationTimeSecs:
        auditTimesPerRound.averageConversationTimesSecs?.[roundIndex],
    };
  });

  const chartDataByMonth: PageData["chartDataByMonth"] = auditTimesPerMonth.map(
    (entry) => {
      return {
        name: new Date(entry.month).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        averageAuditTimeSecs: entry.averageAuditTimeSecs,
        averageAllocationTimeSecs: entry.averageAllocationTimeSecs,
      };
    }
  );

  return {
    chartDataByRound,
    chartDataByMonth,
  };
}

export default async function AllocatorAuditTimesChart({
  searchParams,
}: PageProps) {
  const { chartDataByRound, chartDataByMonth } = await fetchPageData({
    editionId: searchParams.roundId
      ? parseInt(searchParams.roundId, 10)
      : undefined,
  });

  return (
    <AuditTimeChart
      chartDataByMonth={chartDataByMonth}
      chartDataByRound={chartDataByRound}
    />
  );
}
