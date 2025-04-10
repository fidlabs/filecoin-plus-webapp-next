"use client";
import { useReportsDetails } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { ProviderMap } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/provider-map";
import { ProviderTable } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/provider-table";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { cn } from "@/lib/utils";

const ProvidersView = () => {
  const { colsStyle, colsSpanStyle, providersDistribution } =
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
              {
                providerDistribution.filter((provider) => !provider.not_found)
                  .length
              }
            </div>
            <ProviderTable providerDistribution={providerDistribution} />
            <ProviderMap providerDistribution={providerDistribution} />
          </div>
        );
      })}
    </div>
  );
};

export { ProvidersView };
