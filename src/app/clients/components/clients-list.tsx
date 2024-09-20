"use client"
import {DataTable} from "@/components/ui/data-table";
import {useClients} from "@/lib/hooks/dmob.hooks";
import {Card, CardContent} from "@/components/ui/card";
import {IClientsQuery} from "@/lib/interfaces/api.interface";
import {GenericContentFooter, GenericContentHeader} from "@/components/generic-content-view";
import {InfoIcon, LoaderCircle} from "lucide-react";
import {getClients} from "@/lib/api";
import {useParamsQuery} from "@/lib/hooks/useParamsQuery";
import {useClientsColumns} from "@/app/clients/components/useClientsColumns";
import {PageHeader, PageTitle} from "@/components/ui/title";
import {ClientsStats} from "@/app/clients/components/clients-stats";

const ClientsList = () => {

  const {params, patchParams} = useParamsQuery<IClientsQuery>({
    page: '1',
    limit: '10',
    sort: '',
    filter: ''
  })

  const {
    data,
    loading
  } = useClients(params)

  const {columns, csvHeaders} = useClientsColumns((key, direction) => patchParams({sort: `[["${key}",${direction}]]`}));

  return <div>
    <PageHeader>
      <PageTitle>Clients</PageTitle>
    </PageHeader>
    {data && <ClientsStats data={data}/>}
    <Card className="mt-4">
      <GenericContentHeader placeholder="Client ID / Address / Name" query={params?.filter}
                            getCsv={{
                              method: async () => {
                                const data = await getClients(params)
                                return {
                                  data: data.data as never[]
                                }
                              },
                              title: 'clients.csv',
                              headers: csvHeaders
                            }}
                            setQuery={(filter: string) => patchParams({filter, page: '1'})}>
        <div className="flex flex-row gap-6 items-baseline">
          <h1 className="text-2xl text-black leading-none font-semibold flex items-center gap-2">
            <p>
              {loading && <LoaderCircle className="animate-spin"/>}
              {data?.count}
            </p>
            <p>Clients</p>
          </h1>
        </div>
      </GenericContentHeader>
      <CardContent className="p-0 m-0 border-b bg-[#F2F9FF]">
        <div className="flex items-center px-6 py-2 gap-3">
          <InfoIcon className="w-5 h-5 bg-[#475A6E] rounded-full text-white flex flex-col items-center justify-center"/>
          <p className="text-sm">Note: Clients that receive automatic DataCap allocations from the verify.glif.io site maintained by the Infinite Scroll allocator are marked as &quot;Glif auto verified.&quot;</p>
        </div>
      </CardContent>
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
  </div>
}

export {ClientsList};