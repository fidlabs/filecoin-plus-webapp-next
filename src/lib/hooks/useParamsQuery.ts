import {useCallback, useEffect, useState} from "react";
import {IAllocatorsQuery, IApiQuery} from "@/lib/interfaces/api.interface";
import {usePathname, useRouter, useSearchParams} from "next/navigation";


const useParamsQuery = <T>(initialParams?: IApiQuery) => {
  const query = useSearchParams()
  const pathName = usePathname()
  const router = useRouter()

  const [params, setParams] = useState<IApiQuery | undefined>(initialParams)

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

  useEffect(() => {
    if (params) {
      return
    }
    const paramsEntries = Object.fromEntries(query);
    setParams({
      filter: paramsEntries.filter ?? '',
      limit: +(paramsEntries.limit ?? 10),
      page: +(paramsEntries.page ?? 1),
      sort: paramsEntries.sort ?? '',
      ...paramsEntries
    })
  }, [query, params])

  return {
    params: params as T,
    patchParams
  }
}

export {useParamsQuery};