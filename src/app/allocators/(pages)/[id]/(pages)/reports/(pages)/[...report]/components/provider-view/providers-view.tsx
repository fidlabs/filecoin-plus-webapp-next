"use client";
import { ProviderMap } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/provider-map";
import { ProviderTable } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/provider-table";
import { useReportsDetails } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { IAllocatorReportProviderPaginationQuery } from "@/lib/interfaces/api.interface";
import { cn } from "@/lib/utils";

const ProvidersView = ({
  queryParams,
}: {
  queryParams?: IAllocatorReportProviderPaginationQuery;
}) => {
  const { colsStyle, colsSpanStyle, providersDistribution, reports } =
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
          stored data for this allocator.
        </p>
      </div>
      {providersDistribution.map((providerDistribution, index) => {
        return (
          <div key={index} className="border-b [&:not(:last-child)]:border-r-2">
            <div className="p-4 flex items-center gap-1">
              Number of providers:{" "}
              {reports[0].storage_provider_distribution.pagination?.total}
            </div>
            <ProviderTable
              providerDistribution={providerDistribution}
              queryParams={queryParams}
              totalPages={
                reports[0].storage_provider_distribution.pagination?.total
              }
            />
            <ProviderMap providerDistribution={providerDistribution} />
          </div>
        );
      })}
    </div>
  );
};

export { ProvidersView };
