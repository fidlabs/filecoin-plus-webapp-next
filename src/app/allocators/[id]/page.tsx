"use client"
import {Card, CardContent} from "@/components/ui/card";
import {GenericContentFooter, GenericContentHeader} from "@/components/generic-content-view";
import {getClients} from "@/lib/api";
import {LoaderCircle} from "lucide-react";
import {DataTable} from "@/components/ui/data-table";
import {useAllocatorDetails} from "@/app/allocators/[id]/components/allocator.provider";
import {useVerifiedClientsColumns} from "@/app/allocators/[id]/components/useVerifiedClientsColumns";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import Link from "next/link";

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
                          getCsv={{
                            method: async () => {
                              const data = await getClients(params)
                              return {
                                data: data.data as never[]
                              }
                            },
                            title: 'clients.csv',
                            headers: csvHeaders
                          }}>
      <div className="flex flex-row gap-6 items-baseline">
        <Tabs value="list">
          <TabsList>
            <TabsTrigger asChild value="list">
              <Link href={`/allocators/${allocatorId}`}>
                <h1 className="text-xl font-normal text-black leading-none flex items-center gap-2">
                  <p>
                    {loading && !data && <LoaderCircle size={15} className="animate-spin"/>}
                    {data?.count}
                  </p>
                  <p>Verified Clients</p>
                </h1>
              </Link>
            </TabsTrigger>
            <TabsTrigger asChild value="chart">
              <Link href={`/allocators/${allocatorId}/over-time`}>
                <h2 className="text-xl text-black leading-none font-normal flex items-center gap-2">
                  <p>Allocations over time</p>
                </h2>
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
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