"use client";
import {
  IClientAllocationsResponse,
  IClientProviderBreakdownResponse,
  IClientResponse
} from "@/lib/interfaces/dmob/client.interface";
import {createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {
  generateClientReport,
  getClientAllocationsById,
  getClientById,
  getClientProviderBreakdownById,
  getClientReports
} from "@/lib/api";
import {convertBytesToIEC} from "@/lib/utils";
import {ITabNavigatorTab} from "@/components/ui/tab-navigator";
import {IClientReportsResponse} from "@/lib/interfaces/cdp/cdp.interface";

interface IClientContext {
  data?: IClientResponse;
  loading: boolean;
  reportGenerating: boolean;
  tabs: ITabNavigatorTab[];
  providersData: IClientProviderBreakdownResponse | undefined;
  allocationsData: IClientAllocationsResponse | undefined;
  reportsData: IClientReportsResponse | undefined;
  getProvidersData: () => void;
  getAllocationsData: () => void;
  getReportsData: () => void;
  generateNewReport: () => void;
  activeProviderIndex: number;
  setActiveProviderIndex: (index: number) => void;
  providersChartData: { name: string, value: number, totalSize: string, valueString: string }[];
}

const ClientContext = createContext<IClientContext>({
  data: undefined,
  loading: false,
  reportGenerating: false,
  tabs: [],
  providersData: undefined,
  allocationsData: undefined,
  reportsData: undefined,
  getReportsData: () => {
  },
  getProvidersData: () => {
  },
  getAllocationsData: () => {
  },
  generateNewReport: () => {
  },
  activeProviderIndex: 0,
  setActiveProviderIndex: () => {
  },
  providersChartData: [],
} as IClientContext);

const ClientProvider = ({children, id, initialData}: PropsWithChildren<{
  id: string,
  initialData: IClientResponse
}>) => {

  const [loading, setLoading] = useState(false)
  const [reportGenerating, setReportGenerating] = useState(false)
  const [data, setData] = useState<IClientResponse | undefined>(initialData)
  const [providersData, setProvidersData] = useState<IClientProviderBreakdownResponse | undefined>(undefined)
  const [reportsData, setReportsData] = useState<IClientReportsResponse | undefined>(undefined)
  const [allocationsData, setAllocationsData] = useState<IClientAllocationsResponse | undefined>(undefined)
  const [activeProviderIndex, setActiveProviderIndex] = useState(-1);

  const tabs = useMemo(() => {
    return [
      {
        label: 'Latest claims',
        href: `/clients/${id}`,
        value: 'list'
      },
      {
        label: 'Providers',
        href: `/clients/${id}/providers`,
        value: 'providers'
      },
      {
        label: 'Allocations',
        href: `/clients/${id}/allocations`,
        value: 'allocations'
      },
      {
        label: 'Reports',
        href: `/clients/${id}/reports`,
        value: 'reports'
      }
    ] as ITabNavigatorTab[]
  }, [id])

  const getProvidersData = useCallback(() => {
    if (providersData) {
      return
    }

    setLoading(true);
    getClientProviderBreakdownById(id).then(setProvidersData)
      .finally(() => setLoading(false))
  }, [id, providersData])

  const getAllocationsData = useCallback(() => {
    if (allocationsData) {
      return
    }

    setLoading(true);
    getClientAllocationsById(id).then(setAllocationsData)
      .finally(() => setLoading(false))
  }, [id, allocationsData])

  const getReportsData = useCallback((override = false) => {
    if (reportsData && !override) {
      return
    }

    setLoading(true);
    getClientReports(id).then(setReportsData)
      .finally(() => setLoading(false))
  }, [id, reportsData])

  const generateNewReport = useCallback(() => {
    setReportGenerating(true);
    generateClientReport(id)
      .then(() => setReportGenerating(false))
      .then(() => getReportsData(true))
  }, [getReportsData, id])

  const providersChartData = useMemo(() => {
    if (!providersData?.stats?.length) {
      return [];
    }

    return providersData?.stats?.map((item) => ({
      name: item.provider,
      value: +item.percent,
      totalSize: convertBytesToIEC(+item.total_deal_size),
      valueString: `${convertBytesToIEC(+item.total_deal_size)} (${item.percent}%)`
    }));

  }, [providersData]);

  useEffect(() => {
    setLoading(true);
    getClientById(id, {
      page: '1',
      limit: '15',
      sort: `[["createdAt", 0]]`
    })
      .then((data) => {
        setData(data)
      })
      .finally(() => setLoading(false))
  }, [id]);

  return <ClientContext.Provider value={{
    data,
    tabs,
    loading,
    providersData,
    getProvidersData,
    activeProviderIndex,
    setActiveProviderIndex,
    providersChartData,
    allocationsData,
    getAllocationsData,
    reportsData,
    getReportsData,
    generateNewReport,
    reportGenerating
  }}>
    <main className="flex flex-col gap-8 items-start">
      <div className="w-full">
        {children}
      </div>
    </main>
  </ClientContext.Provider>
}

const useClientDetails = () => {
  return useContext(ClientContext)
}

export {ClientProvider, useClientDetails};