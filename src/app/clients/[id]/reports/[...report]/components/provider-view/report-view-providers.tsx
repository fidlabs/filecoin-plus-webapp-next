"use client";

import { HealthCheck } from "@/components/health-check";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { type IClientFullReport } from "@/lib/interfaces/cdp/cdp.interface";
import { cn } from "@/lib/utils";
import { ReportViewProviderMap } from "./report-view-provider-map";
import { ReportViewProviderTable } from "./report-view-provider-table";

export interface ReportViewProvidersProps {
  comparsionEnabled: boolean;
  reports: IClientFullReport[];
}

export function ReportViewProviders({
  comparsionEnabled,
  reports,
}: ReportViewProvidersProps) {
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
          stored data for this client.
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
              <div className="flex items-center gap-1">
                <HealthCheck
                  security={report.check_results.filter(
                    (item) =>
                      item.check.startsWith("STORAGE_PROVIDER_DISTRIBUTION") ||
                      item.check.startsWith("STORAGE_PROVIDER_URL_FINDER")
                  )}
                />
                Number of providers:{" "}
                {
                  report.storage_provider_distribution.filter(
                    (provider) => !provider.not_found
                  ).length
                }
              </div>
              <ReportViewProviderTable
                report={report}
                reportToCompare={
                  comparsionEnabled ? reports[index - 1] : undefined
                }
              />
              <ReportViewProviderMap
                providerDistribution={report.storage_provider_distribution}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
