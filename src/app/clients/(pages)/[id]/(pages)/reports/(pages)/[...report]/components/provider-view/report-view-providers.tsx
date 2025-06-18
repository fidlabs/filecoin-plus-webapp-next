"use client";

import { ReportViewProviderMap } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/report-view-provider-map";
import { ReportViewProviderTable } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/report-view-provider-table";
import { useReportsDetails } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { HealthCheck } from "@/components/health-check";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { cn } from "@/lib/utils";

export function ReportViewProviders() {
  const { colsStyle, colsSpanStyle, providerDistributionList, securityChecks } =
    useReportsDetails();

  const { top, ref } = useScrollObserver();

  return (
    <div className="grid" style={colsStyle}>
      <div
        ref={ref}
        className={cn(
          "p-4 border-b sticky top-[147px] bg-white",
          top > 90 && "z-[5]",
          top === 147 && "shadow-md"
        )}
        style={colsSpanStyle}
      >
        <h2 className="font-semibold text-lg">Storage Provider Distribution</h2>
        <p className="pt-2">
          The below table shows the distribution of storage providers that have
          stored data for this client.
        </p>
      </div>
      {providerDistributionList.map((providerDistribution, index) => {
        return (
          <div key={index} className="border-b [&:not(:last-child)]:border-r-2">
            <div className="flex items-center gap-1">
              {securityChecks[index] && (
                <HealthCheck
                  security={securityChecks[index]?.filter((item) =>
                    item.check.startsWith("STORAGE_PROVIDER_DISTRIBUTION")
                  )}
                />
              )}
              Number of providers:{" "}
              {
                providerDistribution.filter((provider) => !provider.not_found)
                  .length
              }
            </div>
            <ReportViewProviderTable
              providerDistribution={providerDistribution}
            />
            <ReportViewProviderMap
              providerDistribution={providerDistribution}
            />
          </div>
        );
      })}
    </div>
  );
}
