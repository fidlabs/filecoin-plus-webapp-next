"use client";
import {
  IClientAllocationsResponse,
  IClientProviderBreakdownResponse,
  IClientResponse
} from "@/lib/interfaces/dmob/client.interface";
import {IApiQuery} from "@/lib/interfaces/api.interface";
import {createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {useParamsQuery} from "@/lib/hooks/useParamsQuery";
import {getClientAllocationsById, getClientById, getClientProviderBreakdownById} from "@/lib/api";
import {convertBytesToIEC} from "@/lib/utils";

interface IClientContext {
  data?: IClientResponse;
  loading: boolean;
  params: IApiQuery;
  patchParams: (newParams: IApiQuery) => void;
  providersData: IClientProviderBreakdownResponse | undefined;
  allocationsData: IClientAllocationsResponse | undefined;
  getProvidersData: () => void;
  getAllocationsData: () => void;
  activeProviderIndex: number;
  setActiveProviderIndex: (index: number) => void;
  providersChartData: { name: string, value: number, totalSize: string, valueString: string }[];
}

const ClientContext = createContext<IClientContext>({
  data: undefined,
  loading: false,
  params: {
    page: '1',
    limit: '10',
    sort: ''
  },
  patchParams: () => {},
  providersData: undefined,
  allocationsData: undefined,
  getProvidersData: () => {},
  getAllocationsData: () => {},
  activeProviderIndex: 0,
  setActiveProviderIndex: () => {},
  providersChartData: [],
} as IClientContext);

const ClientProvider = ({children, id, initialData}: PropsWithChildren<{ id: string, initialData: IClientResponse }>) => {

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<IClientResponse | undefined>(initialData)
  const [providersData, setProvidersData] = useState<IClientProviderBreakdownResponse | undefined>(undefined)
  const [allocationsData, setAllocationsData] = useState<IClientAllocationsResponse | undefined>(undefined)
  const [activeProviderIndex, setActiveProviderIndex] = useState(-1);

  const {params, patchParams} = useParamsQuery<IApiQuery>({
    page: '1',
    limit: '10',
    sort: ''
  } as IApiQuery)

  const getProvidersData = useCallback( () => {
    if (providersData) {
      return
    }

    setLoading(true);
    getClientProviderBreakdownById(id).then(setProvidersData)
      .finally(() => setLoading(false))
  }, [id, providersData])

  const getAllocationsData = useCallback( () => {
    if (allocationsData) {
      return
    }

    setLoading(true);
    getClientAllocationsById(id).then(setAllocationsData)
      .finally(() => setLoading(false))
  }, [id, allocationsData])

  const providersChartData = useMemo(() => {
    if (!providersData?.stats?.length) {
      return [];
    }

    console.log(providersData)

    return providersData?.stats?.map((item) => ({
      name: item.provider,
      value: +item.percent,
      totalSize: convertBytesToIEC(+item.total_deal_size),
      valueString: `${convertBytesToIEC(+item.total_deal_size)} (${item.percent}%)`
    }));

  }, [providersData]);

  useEffect(() => {
    if (!params) {
      return
    }
    setLoading(true);
    getClientById(id, params)
      .then((data) => {
        setData(data)
      })
      .finally(() => setLoading(false))
  }, [id, params]);

  return <ClientContext.Provider value={{
    data,
    loading,
    params,
    patchParams,
    providersData,
    getProvidersData,
    activeProviderIndex,
    setActiveProviderIndex,
    providersChartData,
    allocationsData,
    getAllocationsData
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