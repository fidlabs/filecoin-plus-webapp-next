"use client";

import { useDataCapClaimsColumns } from "@/app/clients/(pages)/[id]/components/useDataCapClaimsColumns";
import {
  GenericContentFooter,
  GenericContentHeader,
} from "@/components/generic-content-view";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ITabNavigatorTab } from "@/components/ui/tab-navigator";
import { getClientLatestClaimsByClientId, getClients } from "@/lib/api";
import { useParamsQuery } from "@/lib/hooks/useParamsQuery";
import { IClientLatestClaimsResponse } from "@/lib/interfaces/dmob/client.interface";
import { useMemo } from "react";

export interface LatestClaimsProps {
  clientId: string;
  data: IClientLatestClaimsResponse;
  searchParams: Record<string, string | undefined>;
}

export function LatestClaims({
  clientId,
  data,
  searchParams,
}: LatestClaimsProps) {
  const { columns, csvHeaders } = useDataCapClaimsColumns();
  const { patchParams } = useParamsQuery(searchParams);

  const tabs = useMemo(() => {
    return [
      {
        label: "Latest Claims",
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
            const data = await getClientLatestClaimsByClientId(
              clientId,
              searchParams
            );

            return {
              data: data.data as never[],
            };
          },
          title: `${clientId}_latest_deals.csv`,
          headers: csvHeaders,
        }}
      />
      <CardContent className="p-0">
        <DataTable columns={columns} data={data!.data} />
      </CardContent>
      <GenericContentFooter
        page={data.pagination.page.toString(10)}
        total={data.pagination.total.toString(10)}
        limit={data.pagination.limit.toString(10)}
        paginationSteps={["15", "25", "50"]}
        patchParams={patchParams}
      />
    </Card>
  );
}
