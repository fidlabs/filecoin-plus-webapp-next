"use client";
import {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";
import {getStorageProviderById} from "@/lib/api";
import {useParamsQuery} from "@/lib/hooks/useParamsQuery";
import {IApiQuery} from "@/lib/interfaces/api.interface";
import {IStorageProviderResponse} from "@/lib/interfaces/dmob/sp.interface";

interface IStorageProviderContext {
  data?: IStorageProviderResponse;
  loading: boolean;
  params: IApiQuery;
  patchParams: (newParams: IApiQuery) => void;
}

const StorageProviderContext = createContext<IStorageProviderContext>({
  data: undefined,
  loading: false,
  params: {
    page: '1',
    limit: '10',
    sort: ''
  },
  patchParams: (newParams: IApiQuery) => {
    console.log(newParams)
  }
} as IStorageProviderContext);

const StorageProvider = ({children, id, initialData}: PropsWithChildren<{ id: string, initialData: IStorageProviderResponse }>) => {

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<IStorageProviderResponse | undefined>(initialData)

  const {params, patchParams} = useParamsQuery<IApiQuery>({
    page: '1',
    limit: '10',
    sort: ''
  } as IApiQuery)

  useEffect(() => {
    if (!params) {
      return
    }
    setLoading(true);
    getStorageProviderById(id, params)
      .then((data) => {
        setData(data)
      })
      .finally(() => setLoading(false))
  }, [id, params]);

  return <StorageProviderContext.Provider
    value={{data, loading, params, patchParams}}>
    <main className="flex flex-col gap-8 items-start">
      <div className="w-full">
        {children}
      </div>
    </main>
  </StorageProviderContext.Provider>
}

const useStorageProviderDetails = () => {
  return useContext(StorageProviderContext)
}

export {StorageProvider, useStorageProviderDetails};