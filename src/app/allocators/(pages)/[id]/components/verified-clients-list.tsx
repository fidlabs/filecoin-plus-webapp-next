"use client";
import {useVerifiedClientsColumns} from "@/app/allocators/(pages)/[id]/components/useVerifiedClientsColumns";
import {IAllocatorResponse} from "@/lib/interfaces/dmob/allocator.interface";
import {IApiQuery} from "@/lib/interfaces/api.interface";
import {useParamsQuery} from "@/lib/hooks/useParamsQuery";
import {GenericContentFooter, GenericContentHeader} from "@/components/generic-content-view";
import {ComplianceDownloadButton} from "@/components/compliance-button";
import {getClients} from "@/lib/api";
import {Card, CardContent} from "@/components/ui/card";
import {DataTable} from "@/components/ui/data-table";
import {useMemo} from "react";
import {ITabNavigatorTab} from "@/components/ui/tab-navigator";

interface IPageProps {
  allocatorId: string
  data: IAllocatorResponse
  searchParams: IApiQuery
}

const VerifiedClientsList = ({allocatorId, data, searchParams}: IPageProps) => {
  const {patchParams} = useParamsQuery(searchParams)

  const tabs = useMemo(() => {
    return [
      {
        label: <>
          <p>
            {data?.count}
          </p>
          <p>Verified Clients</p>
        </>,
        href: `/allocators/${allocatorId}`,
        value: 'list'
      },
      {
        label: 'Allocations over time',
        href: `/allocators/${allocatorId}/over-time`,
        value: 'chart'
      }
    ] as ITabNavigatorTab[]
  }, [allocatorId, data])

  const {
    columns,
    csvHeaders
  } = useVerifiedClientsColumns((key, direction) => patchParams({sort: `[["${key}",${direction}]]`}));


  return <Card>
    <GenericContentHeader placeholder="Client ID / Address / Name"
                          fixedHeight={false}
                          addons={<ComplianceDownloadButton id={allocatorId}/>}
                          navigation={tabs}
                          selected={'list'}
                          getCsv={{
                            method: async () => {
                              const data = await getClients(searchParams)
                              return {
                                data: data.data as never[]
                              }
                            },
                            title: 'clients.csv',
                            headers: csvHeaders,
                          }}/>
    <CardContent className="p-0">
      <DataTable columns={columns} data={data!.data}/>
    </CardContent>
    <GenericContentFooter page={searchParams?.page} limit={searchParams?.limit} total={(data?.count ?? '0')}
                          patchParams={patchParams}/>
  </Card>

}

export {VerifiedClientsList}