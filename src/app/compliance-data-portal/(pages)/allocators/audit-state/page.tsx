import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { fetchAllocatorsAuditStates } from "@/lib/api";
import { AuditStatesChart } from "./components/audit-states-chart";
import { AuditStatesChartFilters } from "./components/audit-states-chart-filters";

export const revalidate = 300;

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

interface LoadDataParameters {
  editionId?: number;
  showInactive?: boolean;
  showAuditedOnly?: boolean;
}

async function loadData({
  editionId = 6,
  showInactive = false,
  showAuditedOnly = false,
}: LoadDataParameters) {
  const auditStates = await fetchAllocatorsAuditStates({
    editionId: editionId.toString(),
  });

  return auditStates.filter((entry) => {
    const active = showInactive || entry.audits.length > 0;
    const audited =
      !showAuditedOnly ||
      entry.audits.some((audit) => {
        return ["passed", "passedConditionally", "failed"].includes(
          audit.outcome
        );
      });

    return active && audited;
  });
}

export default async function AllocatorsAuditStatePage({
  searchParams,
}: PageProps) {
  const auditStates = await loadData({
    editionId: searchParams.roundId
      ? parseInt(searchParams.roundId, 10)
      : undefined,
    showInactive: searchParams.showInactive === "true",
    showAuditedOnly: searchParams.showAuditedOnly === "true",
  });

  return (
    <ChartWrapper
      title="Audit State of the Allocators"
      id="AuditStateAllocator"
    >
      <AuditStatesChartFilters className="mb-4" />
      <AuditStatesChart data={auditStates} />
    </ChartWrapper>
  );
}
