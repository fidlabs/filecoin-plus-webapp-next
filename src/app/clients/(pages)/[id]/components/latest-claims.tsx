"use client";
import { useDataCapClaimsColumns } from "@/app/clients/(pages)/[id]/components/useDataCapClaimsColumns";
import {
  GenericContentFooter,
  GenericContentHeader,
} from "@/components/generic-content-view";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ITabNavigatorTab } from "@/components/ui/tab-navigator";
import { getClients } from "@/lib/api";
import { useParamsQuery } from "@/lib/hooks/useParamsQuery";
import { IApiQuery } from "@/lib/interfaces/api.interface";
import { IClientLatestClaimsResponse } from "@/lib/interfaces/dmob/client.interface";
import { useMemo } from "react";

interface IPageProps {
  clientId: string;
  data: IClientLatestClaimsResponse;
  searchParams: IApiQuery;
}

const LatestClaims = ({ clientId, data, searchParams }: IPageProps) => {
  const { columns, csvHeaders } = useDataCapClaimsColumns();

  const { patchParams } = useParamsQuery(searchParams);

  const tabs = useMemo(() => {
    return [
      {
        label: "Latest claims",
        href: `/clients/${clientId}`,
        value: "list",
      },
      {
        label: "Providers",
        href: `/clients/${clientId}/providers`,
        value: "providers",
      },
      {
        label: "Allocations",
        href: `/clients/${clientId}/allocations`,
        value: "allocations",
      },
      {
        label: "Reports",
        href: `/clients/${clientId}/reports`,
        value: "reports",
      },
    ] as ITabNavigatorTab[];
  }, [clientId]);

  return (
    <Card>
      <GenericContentHeader
        placeholder="Storage Provider ID"
        sticky
        fixedHeight={false}
        navigation={tabs}
        query={searchParams?.filter}
        selected="list"
        setQuery={(filter: string) =>
          patchParams({
            page: "1",
            limit: "15",
            sort: "createdAt",
            order: "desc",
            filter,
          })
        }
        getCsv={{
          method: async () => {
            const data = await getClients();
            return {
              data: data.data as never[],
            };
          },
          title: "clients.csv",
          headers: csvHeaders,
        }}
      />
      <CardContent className="p-0">
        <DataTable columns={columns} data={data!.data} />
      </CardContent>
      <GenericContentFooter
        page={searchParams?.page}
        currentElements={data.data?.length || 0}
        limit={searchParams?.limit}
        paginationSteps={["15", "25", "50"]}
        patchParams={patchParams}
      />
    </Card>
  );
};

export { LatestClaims };
