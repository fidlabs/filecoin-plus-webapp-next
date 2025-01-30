"use client";
import {
  ICDPAllocatorFullReport, ICDPAllocatorFullReportClient,
} from "@/lib/interfaces/cdp/cdp.interface";
import {createContext, CSSProperties, PropsWithChildren, useContext, useMemo, useState} from "react";

interface IReportsDetailsContext {
  reports: ICDPAllocatorFullReport[]
  clients: ICDPAllocatorFullReportClient[][]
  compareMode: boolean
  toggleCompareMode: () => void
  colsStyle: CSSProperties
  colsSpanStyle: CSSProperties
}

const ReportsDetailsContext = createContext<IReportsDetailsContext>({
  reports: [],
  clients: [],
  colsStyle: {},
  colsSpanStyle: {},
  toggleCompareMode: () => {
  },
  compareMode: false,
});

const ReportsDetailsProvider = ({children, reports}: PropsWithChildren<{ reports: ICDPAllocatorFullReport[] }>) => {

  const [compareMode, setCompareMode] = useState(false);


  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
  }

  const colsStyle = useMemo(() => ({
    gridTemplateColumns: `repeat(${reports.length}, minmax(0, 1fr))`
  }), [reports])

  const colsSpanStyle = useMemo(() => ({
    gridColumn: `span ${reports.length} / span ${reports.length}`
  }), [reports]);

  const clients = useMemo(() => reports.map(report => report.clients), [reports])

  return <ReportsDetailsContext.Provider
    value={{
      reports,
      clients,
      colsStyle,
      colsSpanStyle,
      compareMode,
      toggleCompareMode
    }}>
    {children}
  </ReportsDetailsContext.Provider>
}

const useReportsDetails = () => {
  return useContext(ReportsDetailsContext);
}

export {ReportsDetailsProvider, useReportsDetails}

