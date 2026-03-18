"use client";

import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { type ICDPAllocatorFullReport } from "@/lib/interfaces/cdp/cdp.interface";
import { cn } from "@/lib/utils";
import { ProviderMap } from "./provider-map";
import { ProviderTable } from "./provider-table";

export interface ProvidersViewProps {
  allocatorId: string;
  comparsionEnabled: boolean;
  reports: ICDPAllocatorFullReport[];
}

export function ProvidersView({
  allocatorId,
  comparsionEnabled,
  reports,
}: ProvidersViewProps) {
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
        <h2 className="font-semibold text-lg">Storage Provider Distribution</h2>
        <p className="pt-2">
          The below table shows the distribution of storage providers that have
          stored data for this allocator.
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
              <div className="p-4 flex items-center gap-1">
                Number of providers:{" "}
                {report.storage_provider_distribution.pagination?.total ??
                  "N/A"}
              </div>
              <ProviderTable
                allocatorId={allocatorId}
                reportId={report.id}
                comparedReportId={
                  comparsionEnabled ? reports[index - 1]?.id : undefined
                }
              />
              <ProviderMap
                providerDistribution={report.storage_provider_distribution.data}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
