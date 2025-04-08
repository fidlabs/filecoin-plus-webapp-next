"use client";
import { useAuditTimeline } from "@/lib/hooks/google.hooks";
import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { StackedBarGraph } from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import { useState } from "react";

const AllocatorAuditTimeline = () => {
  const [currentScale, setCurrentScale] = useState("linear");

  const { results, loading } = useAuditTimeline(currentScale);

  return (
    <ChartWrapper
      title="Governance Compliance Audit Timeline"
      id="AuditTimelineAllocator"
      scales={["linear", "percent"]}
      selectedScale={currentScale}
      setSelectedScale={setCurrentScale}
    >
      <StackedBarGraph
        currentDataTab={"Count"}
        usePercentage={currentScale === "percent"}
        data={results}
        unit={"day"}
        isLoading={loading}
        customPalette={["#525252", "#66a61e"]}
      />
    </ChartWrapper>
  );
};

export default AllocatorAuditTimeline;
