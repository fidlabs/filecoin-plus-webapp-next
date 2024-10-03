"use client"
import {Card, CardContent} from "@/components/ui/card";
import {GenericContentFooter, GenericContentHeader} from "@/components/generic-content-view";
import {getClients} from "@/lib/api";
import {LoaderCircle} from "lucide-react";
import {DataTable} from "@/components/ui/data-table";
import {useDataCapClaimsColumns} from "@/app/clients/(pages)/[id]/components/useDataCapClaimsColumns";
import {useClientDetails} from "@/app/clients/(pages)/[id]/components/client.provider";
import {ComplianceDownloadButton} from "@/components/compliance-button";

interface IPageProps {
  params: { id: string }
}

const ClientDetailsPage = (pageParams: IPageProps) => {
  const clientId = pageParams.params.id

  const {data, tabs, loading, params, patchParams} = useClientDetails()
  const {
    columns,
    csvHeaders
  } = useDataCapClaimsColumns((key, direction) => patchParams({sort: `[["${key}",${direction}]]`}));

  return <Card>
    <GenericContentHeader placeholder="Storage Provider ID"
                          sticky
                          fixedHeight={false}
                          addons={<ComplianceDownloadButton id={clientId}/>}
                          setQuery={(filterString: string) => {
                            const filter = filterString.startsWith('f0') ? filterString.substring(2) : filterString
                            if (params.filter !== filter) {
                              patchParams({filter, page: '1'})
                            }
                          }}
                          navigation={tabs}
                          selected="list"
                          getCsv={{
                            method: async () => {
                              const data = await getClients(params)
                              return {
                                data: data.data as never[]
                              }
                            },
                            title: 'clients.csv',
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

export default ClientDetailsPage