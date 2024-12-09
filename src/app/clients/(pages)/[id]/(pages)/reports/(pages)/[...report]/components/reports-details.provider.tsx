"use client";
import {
  IClientFullReport,
  IClientReportReplicaDistribution,
  IClientReportStorageProviderDistribution
} from "@/lib/interfaces/cdp/cdp.interface";
import {createContext, PropsWithChildren, useContext, useMemo} from "react";

interface IReportsDetailsContext {
  reports: IClientFullReport[]
  providerDistributionList: IClientReportStorageProviderDistribution[][]
  replikasList: IClientReportReplicaDistribution[][]
  mapsConstraints: string
}

const ReportsDetailsContext = createContext<IReportsDetailsContext>({
  reports: [],
  providerDistributionList: [],
  replikasList: [],
  mapsConstraints: ''
});

const ReportsDetailsProvider = ({ children, reports }: PropsWithChildren<{  reports: IClientFullReport[] }>) => {

  const providerDistributionList = useMemo(() => {
    return reports.map(report => report.storage_provider_distribution)
  }, [reports])

  const mapsConstraints = useMemo(() => {
    const locations = providerDistributionList.flatMap(providerList => providerList.map(provider => provider.location));
    console.log(locations)
    return 'TODO'
    }, [providerDistributionList]);

  const replikasList = useMemo(() => {
    return reports.map(report => report.replica_distribution)
  }, [reports])

  return <ReportsDetailsContext.Provider value={{ reports, providerDistributionList, replikasList, mapsConstraints }}>
    {children}
  </ReportsDetailsContext.Provider>
}

const useReportsDetails = () => {
  return useContext(ReportsDetailsContext);
}

export {ReportsDetailsProvider, useReportsDetails}