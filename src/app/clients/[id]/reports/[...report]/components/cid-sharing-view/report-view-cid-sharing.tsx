"use client";

import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { IClientFullReport } from "@/lib/interfaces/cdp/cdp.interface";
import { cn } from "@/lib/utils";
import { ReportViewCidSharingTable } from "./report-view-cid-sharing-table";

export interface ReportViewCidSharingProps {
  comparsionEnabled: boolean;
  reports: IClientFullReport[];
}

export function ReportViewCidSharing({
  comparsionEnabled,
  reports,
}: ReportViewCidSharingProps) {
  const { top, ref } = useScrollObserver();

  return (
    <div>
      <div
        ref={ref}
        className={cn(
          "p-4 border-b sticky top-[147px] bg-white",
          top > 90 && "z-[5]",
          top === 147 && "shadow-md"
        )}
      >
        <h2 className="font-semibold text-lg">
          Deal Data Shared with other Clients
        </h2>
        <p>
          The below table shows how many unique data are shared with other
          clients. Usually different applications owns different data and should
          not resolve to the same CID.
        </p>
        <p>
          However, this could be possible if all below clients use same software
          to prepare for the exact same dataset or they belong to a series of
          LDN applications for the same dataset.
        </p>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${reports.length}, minmax(0, 1fr))`,
        }}
      >
        {reports.map((report, index) => {
          return (
            <div
              key={index}
              className="border-b [&:not(:last-child)]:border-r-2"
            >
              <ReportViewCidSharingTable
                report={report}
                reportToCompare={
                  comparsionEnabled ? reports[index - 1] : undefined
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
