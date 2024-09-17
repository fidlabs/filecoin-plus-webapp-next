"use client";
import {createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {IAllocatorResponse, IClient} from "@/lib/interfaces/dmob.interface";
import {getAllocatorById} from "@/lib/api";
import {PageHeader, PageSubTitle, PageTitle} from "@/components/ui/title";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {convertBytesToIEC} from "@/lib/utils";
import {useParamsQuery} from "@/lib/hooks/useParamsQuery";
import {IAllocatorsQuery, IApiQuery} from "@/lib/interfaces/api.interface";
import {groupBy} from "lodash";

interface IAllocatorContext {
  data?: IAllocatorResponse;
  chartData?: {
    name: string;
    value: number;
    clients: IClient[]
  }[];
  loading: boolean;
  params: IAllocatorsQuery;
  patchParams: (newParams: IApiQuery) => void;
  fetchChartData: () => void;
}

const AllocatorContext = createContext<IAllocatorContext>({
  data: undefined,
  chartData: undefined,
  loading: false,
  params: {
    page: '1',
    limit: '10',
    sort: ''
  },
  patchParams: (newParams: IApiQuery) => {
    console.log(newParams)
  },
  fetchChartData: () => {
  }
} as IAllocatorContext);

const AllocatorProvider = ({children, id}: PropsWithChildren<{ id: string }>) => {

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<IAllocatorResponse | undefined>(undefined)
  const [chartData, setChartData] = useState<IAllocatorResponse | undefined>(undefined)

  const {params, patchParams} = useParamsQuery<IAllocatorsQuery>({
    page: '1',
    limit: '10',
    sort: ''
  } as IAllocatorsQuery)

  useEffect(() => {
    if (!params) {
      return
    }
    setLoading(true);
    getAllocatorById(id, params)
      .then((data) => {
        setData(data)
        if (+data?.count === data.data.length) {
          setChartData(data)
        }
      })
      .finally(() => setLoading(false))
  }, [id, params]);

  const chartDataParsed = useMemo(() => {
    if (!chartData) return [];
    const groupedByHeight = groupBy(chartData.data.sort((a, b) => a.createdAtHeight - b.createdAtHeight), val => val.createdAtHeight);

    const newData = [] as {
      name: string;
      value: number;
      clients: IClient[]
    }[];

    Object.entries(groupedByHeight).forEach(([key, value], index) => {
      const totalDatacap = newData[index - 1]?.value || 0;
      const valueParsed = value.reduce((acc, val) => acc + +val.initialAllowance, 0);
      newData.push({
        name: key,
        value: totalDatacap + valueParsed,
        clients: value
      });
    });

    return newData;
  }, [chartData]);

  const fetchChartData = useCallback(() => {
    if (!!chartData?.data?.length) {
      return
    }
    setLoading(true);
    getAllocatorById(id)
      .then(setChartData)
      .finally(() => setLoading(false))
  }, [chartData, id])

  return <AllocatorContext.Provider
    value={{data, loading, params, patchParams, chartData: chartDataParsed, fetchChartData}}>
    <main className="flex flex-col gap-8 items-start">
      <div className="flex w-full justify-between">
        <PageHeader>
          <PageTitle>
            {data?.name}
          </PageTitle>
          <PageSubTitle>Allocator ID: {data?.addressId}</PageSubTitle>
        </PageHeader>
        <Card className="my-6">
          <CardHeader className="p-4">
            <CardTitle>Remaining DataCap</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {convertBytesToIEC(data?.remainingDatacap)}
          </CardContent>
        </Card>
      </div>
      <div className="w-full">
        {children}
      </div>
    </main>
  </AllocatorContext.Provider>
}

const useAllocatorDetails = () => {
  return useContext(AllocatorContext)
}

export {AllocatorProvider, useAllocatorDetails};