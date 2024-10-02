"use client"
import {Card, CardContent} from "@/components/ui/card";
import {GenericContentFooter, GenericContentHeader} from "@/components/generic-content-view";
import {getClients} from "@/lib/api";
import {LoaderCircle} from "lucide-react";
import {DataTable} from "@/components/ui/data-table";
import {useAllocatorDetails} from "@/app/allocators/(pages)/[id]/components/allocator.provider";
import {useVerifiedClientsColumns} from "@/app/allocators/(pages)/[id]/components/useVerifiedClientsColumns";
import {AllocatorsNavigation} from "@/app/allocators/(pages)/[id]/components/allocators-navigation";
import {ComplianceDownloadButton} from "@/components/compliance-button";

interface IPageProps {
  params: { id: string }
}

const AllocatorDetailsPage = (pageParams: IPageProps) => {
  const allocatorId = pageParams.params.id

  const {data, loading, params, patchParams} = useAllocatorDetails()
  const {
    columns,
    csvHeaders
  } = useVerifiedClientsColumns((key, direction) => patchParams({sort: `[["${key}",${direction}]]`}));

  return <Card>
    <GenericContentHeader placeholder="Client ID / Address / Name"
                          fixedHeight={false}
                          addons={<ComplianceDownloadButton id={allocatorId}/>}
                          getCsv={{
                            method: async () => {
                              const data = await getClients(params)
                              return {
                                data: data.data as never[]
                              }
                            },
                            title: 'clients.csv',
                            headers: csvHeaders,
                          }}>
      <div className="flex flex-row gap-6 items-baseline">
        <AllocatorsNavigation
          selected="list"
          data={data}
          loading={loading}
          allocatorId={allocatorId}
        />
      </div>
    </GenericContentHeader>
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

export default AllocatorDetailsPage