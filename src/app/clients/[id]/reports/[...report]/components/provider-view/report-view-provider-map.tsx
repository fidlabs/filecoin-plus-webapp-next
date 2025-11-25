"use client";
import { GenericProviderMap } from "@/components/generic-provider-map";
import { Skeleton } from "@/components/ui/skeleton";
import { IClientReportStorageProviderDistribution } from "@/lib/interfaces/cdp/cdp.interface";
import { groupBy } from "lodash";
import { Suspense, useMemo } from "react";

interface IReportViewProviderMapProps {
  providerDistribution: IClientReportStorageProviderDistribution[];
}

const ReportViewProviderMap = ({
  providerDistribution,
}: IReportViewProviderMapProps) => {
  const markerGroups = useMemo(
    () =>
      groupBy(
        providerDistribution
          .filter((item) => !item.not_found && !!item.location)
          .map((item) => item.location),
        "loc"
      ),
    [providerDistribution]
  );

  return (
    <Suspense fallback={<Skeleton className="w-full min-h-96 aspect-video" />}>
      <GenericProviderMap markerGroups={markerGroups} />
    </Suspense>
  );
};

export { ReportViewProviderMap };
