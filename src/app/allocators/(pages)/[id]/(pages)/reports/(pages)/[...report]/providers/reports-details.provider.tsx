"use client";
import {
  ICDPAllocatorFullReport,
  AllocatorFullReportClient,
  ICDPAllocatorFullReportStorageProviderDistribution,
} from "@/lib/interfaces/cdp/cdp.interface";
import {
  createContext,
  CSSProperties,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import { calculateAverage, calculateMapScale } from "@/lib/utils";

interface IReportsDetailsContext {
  reports: ICDPAllocatorFullReport[];
  clients: AllocatorFullReportClient[][];
  providersDistribution: ICDPAllocatorFullReportStorageProviderDistribution[][];
  compareMode: boolean;
  toggleCompareMode: () => void;
  colsStyle: CSSProperties;
  colsSpanStyle: CSSProperties;
  mapsConstraints: {
    center: [number, number];
    scale: number;
  };
}

const ReportsDetailsContext = createContext<IReportsDetailsContext>({
  reports: [],
  clients: [],
  providersDistribution: [],
  colsStyle: {},
  colsSpanStyle: {},
  toggleCompareMode: () => {},
  compareMode: false,
  mapsConstraints: {
    center: [0, 0],
    scale: 200,
  },
});

const ReportsDetailsProvider = ({
  children,
  reports,
}: PropsWithChildren<{ reports: ICDPAllocatorFullReport[] }>) => {
  const [compareMode, setCompareMode] = useState(false);

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
  };

  const colsStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${reports.length}, minmax(0, 1fr))`,
    }),
    [reports]
  );

  const colsSpanStyle = useMemo(
    () => ({
      gridColumn: `span ${reports.length} / span ${reports.length}`,
    }),
    [reports]
  );

  const clients = useMemo(
    () => reports.map((report) => report.clients),
    [reports]
  );
  const providersDistribution = useMemo(
    () => reports.map((report) => report.storage_provider_distribution),
    [reports]
  );

  const mapsConstraints = useMemo(() => {
    const locations = providersDistribution.flatMap((providerList) =>
      providerList
        .filter((provider) => !provider.not_found && !!provider.location)
        .map((provider) => provider.location)
    );
    const longitudes = locations.map((location) => +location.loc.split(",")[0]);
    const latitudes = locations.map((location) => +location.loc.split(",")[1]);

    const averageLongitude = calculateAverage(longitudes, 4);
    const averageLatitude = calculateAverage(latitudes, 4);

    const scale = calculateMapScale(locations.map((location) => location.loc));

    return {
      center: [averageLatitude, averageLongitude] as [number, number],
      scale,
    };
  }, [providersDistribution]);

  return (
    <ReportsDetailsContext.Provider
      value={{
        reports,
        clients,
        providersDistribution,
        mapsConstraints,
        colsStyle,
        colsSpanStyle,
        compareMode,
        toggleCompareMode,
      }}
    >
      {children}
    </ReportsDetailsContext.Provider>
  );
};

const useReportsDetails = () => {
  return useContext(ReportsDetailsContext);
};

export { ReportsDetailsProvider, useReportsDetails };
