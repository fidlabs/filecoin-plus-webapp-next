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

  useEffect(() => {
    const paramsEntries = Object.fromEntries(query);
    console.log(paramsEntries)
    console.log(initialParams)
    setParams({
      ...(initialParams ?? {
        page: '1',
        limit: '10',
        sort: ''
      }),
      ...paramsEntries
    })
  }, [])

  return {
    params: params as T,
    patchParams
  }
}

export {useParamsQuery};