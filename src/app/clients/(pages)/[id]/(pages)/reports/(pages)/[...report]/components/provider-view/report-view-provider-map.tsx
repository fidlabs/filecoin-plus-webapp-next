"use client"
import {
  IClientReportStorageProviderDistribution
} from "@/lib/interfaces/cdp/cdp.interface";
import {groupBy} from "lodash";
import {
  useReportsDetails
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {Suspense, useMemo} from "react";
import {GenericProviderMap} from "@/components/generic-provider-map";
import {Skeleton} from "@/components/ui/skeleton";

interface IReportViewProviderMapProps {
  providerDistribution: IClientReportStorageProviderDistribution[]
}

const ReportViewProviderMap = ({providerDistribution}: IReportViewProviderMapProps) => {

  const {
    mapsConstraints
  } = useReportsDetails()

  const markerGroups = useMemo(() => groupBy(providerDistribution.filter(item => !item.not_found && !!item.location).map(item => item.location), 'loc'), [providerDistribution])

  return <Suspense fallback={<Skeleton className="w-full min-h-96 aspect-video"/>}>
    <GenericProviderMap markerGroups={markerGroups} mapsConstraints={mapsConstraints}/>
  </Suspense>

}

export {ReportViewProviderMap}