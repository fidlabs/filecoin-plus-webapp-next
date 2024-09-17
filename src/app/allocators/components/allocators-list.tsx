"use client"
import {DataTable} from "@/components/ui/data-table";
import {useAllocators} from "@/lib/hooks/dmob.hooks";
import {Card, CardContent} from "@/components/ui/card";
import {IAllocatorsQuery} from "@/lib/interfaces/api.interface";
import {GenericContentFooter, GenericContentHeader} from "@/components/generic-content-view";
import {Checkbox} from "@/components/ui/checkbox";
import {LoaderCircle} from "lucide-react";
import {useAllocatorsColumns} from "@/app/allocators/components/useAllocatorsColumns";
import {getAllocators} from "@/lib/api";
import {useParamsQuery} from "@/lib/hooks/useParamsQuery";

const AllocatorsList = () => {
  const {params, patchParams} = useParamsQuery<IAllocatorsQuery>({
    page: '1',
    showInactive: 'false',
    limit: '10',
    filter: '',
    sort: ''
  } as IAllocatorsQuery)

  const {
    data,
    loading
  } = useAllocators(params)

  const {columns, csvHeaders} = useAllocatorsColumns((key, direction) => patchParams({sort: `[["${key}",${direction}]]`}));

  return <Card className="mt-[50px]">
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
                          setQuery={(filter: string) => patchParams({filter, page: '1'})}>
      <div className="flex flex-row gap-6 items-baseline">
        <h1 className="text-2xl text-black leading-none font-semibold flex items-center gap-2">
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
          <Checkbox id="terms" checked={params?.showInactive === 'true'} onCheckedChange={(checked) => patchParams({
            showInactive: !!checked ? 'true' : 'false',
            page: '1'
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
    <GenericContentFooter page={params?.page} limit={params?.limit} total={(data?.count ?? '0')}
                          patchParams={patchParams}/>
  </Card>
}

export {AllocatorsList};