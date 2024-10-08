import {useCallback, useEffect, useState} from "react";
import {IAllocatorsQuery, IApiQuery} from "@/lib/interfaces/api.interface";
import {usePathname, useRouter, useSearchParams} from "next/navigation";


const useParamsQuery = <T>(initialParams?: IApiQuery) => {
  const query = useSearchParams()
  const pathName = usePathname()
  const router = useRouter()

  const [params, setParams] = useState<IApiQuery | undefined>(undefined)

  const patchParams = useCallback((newParams: IApiQuery) => {
    setParams((oldParams) => ({
      ...(oldParams ?? {}),
      ...newParams
    }) as IAllocatorsQuery)
  }, []);

  useEffect(() => {
    if (!params) {
      return
    }
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      searchParams.set(key, value?.toString() ?? '')
    }
    const newPath = `${pathName}?${searchParams.toString()}`
    router.replace(newPath)
  }, [params, pathName, router]);

  const parseInitialParams = useCallback(() => {
    if (params) {
      return
    }
    const paramsEntries = Object.fromEntries(query);
    setParams({
      ...(initialParams ?? {
        page: '1',
        limit: '10',
        sort: '',
      }),
      ...paramsEntries
    })
  }, [initialParams, params, query])

  useEffect(() => {
    parseInitialParams();
  }, [parseInitialParams])

  return {
    params: params as T,
    patchParams
  }
}

export {useParamsQuery};