"use client";
import {IClientFullReport, IClientReportStorageProviderDistribution} from "@/lib/interfaces/cdp/cdp.interface";
import {createContext, PropsWithChildren, useContext, useMemo} from "react";

interface IReportsDetailsContext {
  reports: IClientFullReport[]
  providerDistributionList: IClientReportStorageProviderDistribution[][]
}

const ReportsDetailsContext = createContext<IReportsDetailsContext>({
  reports: [],
  providerDistributionList: []
});

const ReportsDetailsProvider = ({ children, reports }: PropsWithChildren<{  reports: IClientFullReport[] }>) => {

  const providerDistributionList = useMemo(() => {
    return reports.map(report => report.storage_provider_distribution)
  }, [reports])

  return <ReportsDetailsContext.Provider value={{ reports, providerDistributionList }}>
    {children}
  </ReportsDetailsContext.Provider>
}

const useReportsDetails = () => {
  return useContext(ReportsDetailsContext);
}

export {ReportsDetailsProvider, useReportsDetails}