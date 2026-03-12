"use client";
import { GenericProviderMap } from "@/components/generic-provider-map";
import { ICDPAllocatorFullReportStorageProviderDistribution } from "@/lib/interfaces/cdp/cdp.interface";
import { groupBy } from "lodash";
import { useMemo } from "react";

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
