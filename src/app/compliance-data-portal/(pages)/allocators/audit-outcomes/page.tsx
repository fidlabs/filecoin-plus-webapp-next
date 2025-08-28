import {
  type AllocatorsAuditOutcomesResponse,
  fetchAllocatorsAuditOutcomes,
} from "@/lib/api";
import {
  AllocatorsAuditOutcomesChart,
  type AllocatorsAuditOutcomesChartProps,
} from "./components/allocators-audit-outcomes-chart";

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

type Entry = AllocatorsAuditOutcomesResponse[number];
type ChartEntry = AllocatorsAuditOutcomesChartProps["dataByCount"][number];

interface PageData {
  dataByCount: AllocatorsAuditOutcomesChartProps["dataByCount"];
  dataByDatacap: AllocatorsAuditOutcomesChartProps["dataByDatacap"];
}

interface FetchPageDataParams {
  editionId: number;
}

function entryToChartEntry(
  entry: Entry,
  type: "datacap" | "count"
): ChartEntry {
  const values = entry[type];

  return {
    month: new Date(entry.month).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }),
    unknown: values.unknown,
    failed: values.failed,
    passedConditionally: values.passedConditionally,
    passed: values.passed,
    notAudited: values.notAudited,
  };
}

async function fetchPageData({
  editionId,
}: FetchPageDataParams): Promise<PageData> {
  const response = await fetchAllocatorsAuditOutcomes({
    editionId: String(editionId),
  });

  return {
    dataByCount: response.map((entry) => entryToChartEntry(entry, "count")),
    dataByDatacap: response.map((entry) => entryToChartEntry(entry, "datacap")),
  };
}

export default async function AllocatorsAuditOutcomesPage({
  searchParams,
}: PageProps) {
  const { dataByCount, dataByDatacap } = await fetchPageData({
    editionId: searchParams.roundId ? parseInt(searchParams.roundId) : 6,
  });

  return (
    <AllocatorsAuditOutcomesChart
      dataByCount={dataByCount}
      dataByDatacap={dataByDatacap}
    />
  );
}
