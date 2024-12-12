"use client"
import {Card, CardContent} from "@/components/ui/card";
import {GenericContentHeader} from "@/components/generic-content-view";
import {getClients} from "@/lib/api";
import {LoaderCircle} from "lucide-react";
import {DataTable} from "@/components/ui/data-table";
import {useDataCapClaimsColumns} from "@/app/clients/(pages)/[id]/components/useDataCapClaimsColumns";
import {useClientDetails} from "@/app/clients/(pages)/[id]/components/client.provider";

const ClientDetailsPage = () => {
  const {data, tabs, loading} = useClientDetails()
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
                            selected="list"
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
    </Card>
  </div>

}

export default ClientDetailsPage