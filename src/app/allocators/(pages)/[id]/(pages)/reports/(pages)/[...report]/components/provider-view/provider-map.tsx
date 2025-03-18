"use client";
import { groupBy } from "lodash";
import { useReportsDetails } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { useMemo } from "react";
import { ICDPAllocatorFullReportStorageProviderDistribution } from "@/lib/interfaces/cdp/cdp.interface";
import { GenericProviderMap } from "@/components/generic-provider-map";

interface IReportViewProviderMapProps {
  providerDistribution: ICDPAllocatorFullReportStorageProviderDistribution[];
}

const ProviderMap = ({ providerDistribution }: IReportViewProviderMapProps) => {
  const markerGroups = useMemo(
    () =>
      groupBy(
        providerDistribution
          .filter((item) => !item.not_found && !!item.location)
          .map((item) => item.location),
        "region"
      ),
    [providerDistribution]
  );

  return <GenericProviderMap markerGroups={markerGroups} />;
};

export { ProviderMap };
