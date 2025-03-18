"use client";
import { useGoogleSheetsAuditReport } from "@/lib/hooks/google.hooks";
import { useState } from "react";
import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { AuditHistoryBarGraph } from "@/app/compliance-data-portal/components/graphs/audits-history-graph";
import { Checkbox } from "@/components/ui/checkbox";

const AllocatorAuditState = () => {
  const { results, loading } = useGoogleSheetsAuditReport();

  const [showActive, setShowActive] = useState(true);
  const [showAudited, setShowAudited] = useState(true);
  const [hideWaiting, setHideWaiting] = useState(false);

  return (
    <ChartWrapper
      title="Audit State of the Allocators"
      id="AuditStateAllocator"
      addons={[
        {
          name: "Filters",
          value: (
            <div>
              <div className="flex gap-1 items-center">
                <Checkbox
                  checked={showActive}
                  onCheckedChange={(checked) => {
                    setShowActive(!!checked);
                    if (!checked) {
                      setShowAudited(false);
                    }
                  }}
                >
                  Show active
                </Checkbox>
                Show only active allocators
              </div>
              <div className="flex gap-1 items-center">
                <Checkbox
                  checked={showAudited}
                  onCheckedChange={(checked) => {
                    setShowAudited(!!checked);
                    if (!!checked) {
                      setShowActive(true);
                    }
                  }}
                >
                  Show active
                </Checkbox>
                Show only audited allocators
              </div>
              <div className="flex gap-1 items-center">
                <Checkbox
                  checked={hideWaiting}
                  onCheckedChange={(checked) => {
                    setHideWaiting(!!checked);
                  }}
                >
                  Show active
                </Checkbox>
                Hide waiting audits for audited allocators
              </div>
            </div>
          ),
        },
      ]}
    >
      <AuditHistoryBarGraph
        data={results?.data}
        audits={results?.audits}
        isLoading={loading}
        showActive={showActive}
        hideWaiting={hideWaiting}
        showAudited={showAudited}
      />
    </ChartWrapper>
  );
};

export default AllocatorAuditState;
