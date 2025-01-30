"use client";
import {
  IClientFullReport, IClientReportCheckResult, IClientReportCIDSharing,
  IClientReportReplicaDistribution,
  IClientReportStorageProviderDistribution
} from "@/lib/interfaces/cdp/cdp.interface";
import {createContext, CSSProperties, PropsWithChildren, useContext, useMemo, useState} from "react";
import {calculateAverage, calculateMapScale} from "@/lib/utils";

interface IReportsDetailsContext {
  reports: IClientFullReport[]
  compareMode: boolean
  toggleCompareMode: () => void
  providerDistributionList: IClientReportStorageProviderDistribution[][]
  cidSharingList: IClientReportCIDSharing[][]
  replikasList: IClientReportReplicaDistribution[][]
  securityChecks: IClientReportCheckResult[][]
  colsStyle: CSSProperties
  colsSpanStyle: CSSProperties
  mapsConstraints: {
    center: [number, number],
    scale: number
  }
}

const ReportsDetailsContext = createContext<IReportsDetailsContext>({
  reports: [],
  providerDistributionList: [],
  replikasList: [],
  colsStyle: {},
  colsSpanStyle: {},
  cidSharingList: [],
  securityChecks: [],
  toggleCompareMode: () => {
  },
  compareMode: false,
  mapsConstraints: {
    center: [0, 0],
    scale: 200
  }
});

const ReportsDetailsProvider = ({children, reports}: PropsWithChildren<{ reports: IClientFullReport[] }>) => {

  const [compareMode, setCompareMode] = useState(false);


  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
  }

  const providerDistributionList = useMemo(() => {
    return reports.map(report => report.storage_provider_distribution)
  }, [reports])

  const securityChecks = useMemo(() => {
    return reports.map(report => report.check_results)
  }, [reports])

  const mapsConstraints = useMemo(() => {
    const locations = providerDistributionList.flatMap(providerList => providerList.filter(provider => !provider.not_found && !!provider.location).map(provider => provider.location));
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

  const cidSharingList = useMemo(() => {
    return reports.map(report => report.cid_sharing)
  }, [reports])

  const colsStyle = useMemo(() => ({
    gridTemplateColumns: `repeat(${reports.length}, minmax(0, 1fr))`
  }), [reports])

  const colsSpanStyle = useMemo(() => ({
    gridColumn: `span ${reports.length} / span ${reports.length}`
  }), [reports]);

  return <ReportsDetailsContext.Provider
    value={{
      reports,
      providerDistributionList,
      replikasList,
      colsStyle,
      colsSpanStyle,
      mapsConstraints,
      compareMode,
      cidSharingList,
      securityChecks,
      toggleCompareMode
    }}>
    {children}
  </ReportsDetailsContext.Provider>
}

const useReportsDetails = () => {
  return useContext(ReportsDetailsContext);
}

export {ReportsDetailsProvider, useReportsDetails}

