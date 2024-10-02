"use client"
import {DataTable} from "@/components/ui/data-table";
import {useStorageProviders} from "@/lib/hooks/dmob.hooks";
import {Card, CardContent} from "@/components/ui/card";
import {IStorageProvidersQuery} from "@/lib/interfaces/api.interface";
import {GenericContentFooter, GenericContentHeader} from "@/components/generic-content-view";
import {LoaderCircle} from "lucide-react";
import {getStorageProviders} from "@/lib/api";
import {useParamsQuery} from "@/lib/hooks/useParamsQuery";
import {useStorageProvidersColumns} from "@/app/storage-providers/components/useStorageProvidersColumns";

const StorageProvidersList = () => {

  const {params, patchParams} = useParamsQuery<IStorageProvidersQuery>({
    page: '1',
    limit: '10',
    sort: '',
    filter: ''
  })

  const {
    data,
    loading
  } = useStorageProviders(params)

  const {
    columns,
    csvHeaders
  } = useStorageProvidersColumns((key, direction) => patchParams({sort: `[["${key}",${direction}]]`}));

  return <Card className="mt-[50px]">
    <GenericContentHeader placeholder="Storage provider ID" query={params?.filter}
                          getCsv={{
                            method: async () => {
                              const data = await getStorageProviders(params)
                              return {
                                data: data.data as never[]
                              }
                            },
                            title: 'storage-providers.csv',
                            headers: csvHeaders
                          }}
                          setQuery={(filterString: string) => {
                            const filter = filterString.startsWith('f0') ? filterString.substring(2) : filterString
                            if (params.filter !== filter) {
                              patchParams({filter, page: '1'})
                            }
                          }}>
      <div className="flex flex-row gap-6 items-baseline">
        <h1 className="text-2xl text-black leading-none font-semibold flex items-center gap-2">
          <p>
            {loading && <LoaderCircle className="animate-spin"/>}
            {data?.count}
          </p>
          <p>Storage providers</p>
        </h1>
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

export {StorageProvidersList};