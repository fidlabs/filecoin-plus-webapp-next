"use client"
import {DataTable} from "@/components/ui/data-table";
import {useAllocators} from "@/lib/hooks/dmob.hooks";
import {useCallback, useEffect, useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {IAllocatorsQuery, IApiQuery} from "@/lib/interfaces/api.interface";
import {ColumnDef} from "@tanstack/react-table";
import {IAllocator} from "@/lib/interfaces/dmob.interface";
import {GenericContentFooter, GenericContentHeader} from "@/components/generic-content-view";
import {Checkbox} from "@/components/ui/checkbox";
import {LoaderCircle} from "lucide-react";
import {useAllocatorsColumns} from "@/app/allocators/components/useAllocatorsColumns";
import {getAllocators} from "@/lib/api";

const AllocatorsList = () => {
  const pathName = usePathname()
  const router = useRouter()
  const query = useSearchParams()

  const [params, setParams] = useState<IAllocatorsQuery | undefined>(undefined)
  const {
    data,
    loading
  } = useAllocators(params)

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
      showInactive: !!paramsEntries.showInactive,
      sort: paramsEntries.sort ?? '',
    })
  }, [query, params])

  const {columns, csvHeaders} = useAllocatorsColumns((key, direction) => patchParams({sort: `[["${key}",${direction}]]`}));

  return <Card>
    <GenericContentHeader placeholder="Allocator ID / Address / Name" query={params?.filter}
                          getCsv={{
                            method: async () => {
                              const data = await getAllocators(params)
                              return {
                                data: data.data as never[]
                              }
                            },
                            title: 'allocators.csv',
                            headers: csvHeaders
                          }}
                          setQuery={(filter: string) => patchParams({filter, page: 1})}>
      <div className="flex flex-row gap-6 items-baseline">
        <h1 className="text-3xl text-black leading-none font-semibold flex items-center gap-2">
          <p>
            {loading && <LoaderCircle className="animate-spin"/>}
            {data?.count}
          </p>
          <p>Allocators</p>
        </h1>
        <div className="flex items-center space-x-2">
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Show inactive
          </label>
          <Checkbox id="terms" checked={params?.showInactive} onCheckedChange={(checked) => patchParams({
            showInactive: !!checked,
            page: 1
          })}/>
        </div>
      </div>
    </GenericContentHeader>
    <CardContent className="p-0">
      {
        loading && <div className="p-10 w-full flex flex-col items-center justify-center">
          <LoaderCircle className="animate-spin"/>
        </div>
      }
      {data && <DataTable columns={columns} data={data!.data}/>}
    </CardContent>
    <GenericContentFooter page={params?.page} limit={params?.limit} total={+(data?.count ?? 0)}
                          patchParams={patchParams}/>
  </Card>
}

export {AllocatorsList};