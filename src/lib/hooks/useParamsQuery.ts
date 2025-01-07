import {useCallback} from "react";
import {IApiQuery} from "@/lib/interfaces/api.interface";
import {usePathname, useRouter} from "next/navigation";


const useParamsQuery = (initialParams?: IApiQuery) => {
  const pathName = usePathname()
  const router = useRouter()

  const patchParams = useCallback((newParams: IApiQuery) => {
    const paramsToUpdate = {
      ...(initialParams ?? {}),
      ...newParams
    } as IApiQuery;

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(paramsToUpdate)) {
      searchParams.set(key, value?.toString() ?? '')
    }
    const newPath = `${pathName}?${searchParams.toString()}`
    router.push(newPath)

  }, [initialParams, pathName, router]);

  return {
    patchParams
  }
}

export {useParamsQuery};