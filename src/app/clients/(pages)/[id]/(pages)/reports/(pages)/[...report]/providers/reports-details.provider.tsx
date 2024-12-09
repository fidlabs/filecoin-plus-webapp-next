"use client";
import {
  IClientFullReport,
  IClientReportReplicaDistribution,
  IClientReportStorageProviderDistribution
} from "@/lib/interfaces/cdp/cdp.interface";
import {createContext, PropsWithChildren, useContext, useMemo} from "react";
import {calculateAverage, calculateMapScale} from "@/lib/utils";

interface IReportsDetailsContext {
  reports: IClientFullReport[]
  providerDistributionList: IClientReportStorageProviderDistribution[][]
  replikasList: IClientReportReplicaDistribution[][]
  mapsConstraints: {
    center: [number, number],
    scale: number
  }
}

const ReportsDetailsContext = createContext<IReportsDetailsContext>({
  reports: [],
  providerDistributionList: [],
  replikasList: [],
  mapsConstraints: {
    center: [0, 0],
    scale: 200
  }
});

const ReportsDetailsProvider = ({children, reports}: PropsWithChildren<{ reports: IClientFullReport[] }>) => {

  const providerDistributionList = useMemo(() => {
    return reports.map(report => report.storage_provider_distribution)
  }, [reports])

  const mapsConstraints = useMemo(() => {
    const locations = providerDistributionList.flatMap(providerList => providerList.map(provider => provider.location));
    const longitudes = locations.map(location => +location.loc.split(',')[0]);
    const latitudes = locations.map(location => +location.loc.split(',')[1]);

    const averageLongitude = calculateAverage(longitudes, 4);
    const averageLatitude = calculateAverage(latitudes, 4);

    const scale = calculateMapScale(locations.map(location => location.loc));

    return {
      center: [averageLatitude, averageLongitude] as [number, number],
      scale
    }
  }, [providerDistributionList]);

  const replikasList = useMemo(() => {
    return reports.map(report => report.replica_distribution)
  }, [reports])

  return <ReportsDetailsContext.Provider value={{reports, providerDistributionList, replikasList, mapsConstraints}}>
    {children}
  </ReportsDetailsContext.Provider>
}

const useReportsDetails = () => {
  return useContext(ReportsDetailsContext);
}

export {ReportsDetailsProvider, useReportsDetails}