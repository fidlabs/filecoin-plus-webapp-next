"use client"
import {useDataCapClaimsColumns} from "@/app/clients/(pages)/[id]/components/useDataCapClaimsColumns";
import {Card, CardContent} from "@/components/ui/card";
import {GenericContentFooter, GenericContentHeader} from "@/components/generic-content-view";
import {getClients} from "@/lib/api";
import {DataTable} from "@/components/ui/data-table";
import {useMemo} from "react";
import {ITabNavigatorTab} from "@/components/ui/tab-navigator";
import {IApiQuery} from "@/lib/interfaces/api.interface";
import {IClientResponse} from "@/lib/interfaces/dmob/client.interface";
import {useParamsQuery} from "@/lib/hooks/useParamsQuery";

interface IPageProps {
  clientId: string
  data: IClientResponse
  searchParams: IApiQuery
}

const LatestClaims = ({clientId, data, searchParams}: IPageProps) => {
  const {
    columns,
    csvHeaders
  } = useDataCapClaimsColumns();

  const {patchParams} = useParamsQuery(searchParams)

  const tabs = useMemo(() => {
    return [
      {
        label: 'Latest claims',
        href: `/clients/${clientId}`,
        value: 'list'
      },
      {
        label: 'Providers',
        href: `/clients/${clientId}/providers`,
        value: 'providers'
      },
      {
        label: 'Allocations',
        href: `/clients/${clientId}/allocations`,
        value: 'allocations'
      },
      {
        label: 'Reports',
        href: `/clients/${clientId}/reports`,
        value: 'reports'
      }
    ] as ITabNavigatorTab[]
  }, [clientId])

  return <Card>
      <GenericContentHeader placeholder="Storage Provider ID"
                            sticky
                            fixedHeight={false}
                            navigation={tabs}
                            query={searchParams?.filter}
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
        <DataTable columns={columns} data={data!.data}/>
      </CardContent>
      <GenericContentFooter page={searchParams?.page}
                            currentElements={data?.data.length || 0}
                            limit={searchParams?.limit}
                            paginationSteps={['15', '25', '50']}
                            patchParams={patchParams}/>
    </Card>

}

export {LatestClaims}