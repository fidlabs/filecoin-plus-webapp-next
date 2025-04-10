"use client";
import { useGoogleTrustLevels } from "@/lib/hooks/google.hooks";
import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { StackedBarGraph } from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import { useState } from "react";

const AllocatorTrustLevels = () => {
  const [currentScale, setCurrentScale] = useState("linear");
  const [currentTab, setCurrentTab] = useState("PiB");

  const { results, loading } = useGoogleTrustLevels(currentScale, currentTab);

  const unit = currentTab === "Count" ? "allocator" : currentTab;

  return (
    <ChartWrapper
      title="Governance Compliance Audit Outcomes"
      id="AuditOutcomesAllocator"
      tabs={["PiB", "Count"]}
      scales={["linear", "percent"]}
      currentTab={currentTab}
      selectedScale={currentScale}
      setCurrentTab={setCurrentTab}
      setSelectedScale={setCurrentScale}
      addons={[
        {
          name: "What is this chart",
          size: 3,
          expandable: true,
          defaultExpanded: false,
          value: (
            <div>
              <ul className="list-disc">
                <p className="mb-1">
                  The Fil+ Governance Team conducts audits of the Allocators
                  when an Allocator is at 75% of DataCap tranche usage. Based on
                  the historical behaviour of the Allocator, the team decides
                  the size of the next allocation of Data Cap:
                </p>
                <li className="ml-4">
                  If the Allocator showed compliance, they will receive the same
                  or double the previous DataCap allocation.
                </li>
                <li className="ml-4">
                  If the Allocator breached some of their rules, the Governance
                  Team may decide they are partially compliant and allocate half
                  of the previous allocation, giving an Allocator a chance to
                  build up trust again.
                </li>
                <li className="ml-4">
                  If the Allocator exhibited gross misconduct, they will be
                  deemed non-compliant and will not receive any more DataCap.
                </li>
                <li className="ml-4">
                  Non audited Allocators have not yet used up their initial
                  5PiBs of DataCap allocation”
                </li>
              </ul>
            </div>
          ),
        },
      ]}
    >
      <StackedBarGraph
        currentDataTab={currentTab}
        usePercentage={currentScale === "percent"}
        data={results}
        unit={unit}
        isLoading={loading}
        customPalette={["#525252", "#ff0029", "#cf8c00", "#66a61e"]}
      />
    </ChartWrapper>
  );
};

export default AllocatorTrustLevels;
