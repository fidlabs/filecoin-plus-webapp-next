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
}

const ReportsDetailsContext = createContext<IReportsDetailsContext>({
  reports: [],
  providerDistributionList: [],
  replikasList: [],
});

const ReportsDetailsProvider = ({ children, reports }: PropsWithChildren<{  reports: IClientFullReport[] }>) => {

  const providerDistributionList = useMemo(() => {
    return reports.map(report => report.storage_provider_distribution)
  }, [reports])

  const replikasList = useMemo(() => {
    return reports.map(report => report.replica_distribution)
  }, [reports])

  return <ReportsDetailsContext.Provider value={{ reports, providerDistributionList, replikasList }}>
    {children}
  </ReportsDetailsContext.Provider>
}

const useReportsDetails = () => {
  return useContext(ReportsDetailsContext);
}

export {ReportsDetailsProvider, useReportsDetails}