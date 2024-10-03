"use client"
import {Card, CardContent} from "@/components/ui/card";
import {GenericContentFooter, GenericContentHeader} from "@/components/generic-content-view";
import {getClients} from "@/lib/api";
import {LoaderCircle} from "lucide-react";
import {DataTable} from "@/components/ui/data-table";
import {useStorageProviderClientsColumns} from "@/app/storage-providers/(pages)/[id]/components/useStorageProviderClientsColumns";
import {useStorageProviderDetails} from "@/app/storage-providers/(pages)/[id]/components/storage.provider";

interface IPageProps {
  params: { id: string }
}

const StorageProviderDetailsPage = (pageParams: IPageProps) => {
  const {data, loading, params, patchParams} = useStorageProviderDetails()
  const {
    columns,
    csvHeaders
  } = useStorageProviderClientsColumns((key, direction) => patchParams({sort: `[["${key}",${direction}]]`}));

  return <Card>
    <GenericContentHeader placeholder="Client ID / Address / Name"
                          fixedHeight={false}
                          header={<div>
                            <h1 className="text-2xl text-black leading-none font-semibold flex items-center gap-2">
                              <p>
                                {loading && !data?.count && <LoaderCircle className="animate-spin"/>}
                                {data?.count}
                              </p>
                              <p>Verified clients</p>
                            </h1>
                          </div>}
                          getCsv={{
                            method: async () => {
                              const data = await getClients(params)
                              return {
                                data: data.data as never[]
                              }
                            },
                            title: `sp_${pageParams.params.id}_clients.csv`,
                            headers: csvHeaders
                          }} />
    <CardContent className="p-0">
      {
        loading && !data && <div className="p-10 w-full flex flex-col items-center justify-center">
          <LoaderCircle className="animate-spin"/>
        </div>
      }
      {data && <DataTable columns={columns} data={data!.data}/>}
    </CardContent>
    <GenericContentFooter page={params?.page} limit={params?.limit} total={(data?.count ?? '0')}
                          patchParams={patchParams}/>
  </Card>

}

export default StorageProviderDetailsPage