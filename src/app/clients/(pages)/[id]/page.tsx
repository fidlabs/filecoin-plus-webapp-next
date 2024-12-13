"use client"
import {Card, CardContent} from "@/components/ui/card";
import {GenericContentFooter, GenericContentHeader} from "@/components/generic-content-view";
import {getClients} from "@/lib/api";
import {LoaderCircle} from "lucide-react";
import {DataTable} from "@/components/ui/data-table";
import {useDataCapClaimsColumns} from "@/app/clients/(pages)/[id]/components/useDataCapClaimsColumns";
import {useClientDetails} from "@/app/clients/(pages)/[id]/components/client.provider";

const ClientDetailsPage = () => {
  const {data, tabs, loading, params, patchParams} = useClientDetails()
  const {
    columns,
    csvHeaders
  } = useDataCapClaimsColumns();

  return <div className="main-content">
    <Card>
      <GenericContentHeader placeholder="Storage Provider ID"
                            sticky
                            fixedHeight={false}
                            navigation={tabs}
                            query={params?.filter}
                            selected="list"
                            setQuery={(filter: string) => patchParams({
                              page: '1',
                              limit: '15',
                              sort: `[["createdAt", 0]]`,
                              filter
                            })}
                            getCsv={{
                              method: async () => {
                                const data = await getClients()
                                return {
                                  data: data.data as never[]
                                }
                              },
                              title: 'clients.csv',
                              headers: csvHeaders
                            }}/>
      <CardContent className="p-0">
        {
          loading && !data && <div className="p-10 w-full flex flex-col items-center justify-center">
            <LoaderCircle className="animate-spin"/>
          </div>
        }
        {data && <DataTable columns={columns} data={data!.data}/>}
      </CardContent>
      <GenericContentFooter page={params?.page} limit={params?.limit}
                            paginationSteps={['15', '25', '50']}
                            patchParams={patchParams}/>
    </Card>
  </div>

}

export default ClientDetailsPage