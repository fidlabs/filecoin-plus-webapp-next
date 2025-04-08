"use client";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { IStorageProvidersQuery } from "@/lib/interfaces/api.interface";
import {
  GenericContentFooter,
  GenericContentHeader,
} from "@/components/generic-content-view";
import { getStorageProviders } from "@/lib/api";
import { useParamsQuery } from "@/lib/hooks/useParamsQuery";
import { useStorageProvidersColumns } from "@/app/storage-providers/components/useStorageProvidersColumns";
import { ITabNavigatorTab } from "@/components/ui/tab-navigator";
import { IStorageProvidersResponse } from "@/lib/interfaces/dmob/sp.interface";

interface StorageProvidersListProps {
  sps: IStorageProvidersResponse;
  params: IStorageProvidersQuery;
}

const tabs = [
  {
    label: "Storage Providers",
    href: "/storage-providers",
    value: "list",
  },
] as ITabNavigatorTab[];

const StorageProvidersList = ({ sps, params }: StorageProvidersListProps) => {
  const { patchParams } = useParamsQuery(params);

  const { columns, csvHeaders } = useStorageProvidersColumns((key, direction) =>
    patchParams({ sort: `[["${key}",${direction}]]` })
  );

  return (
    <Card className="mt-[50px]">
      <GenericContentHeader
        placeholder="Storage provider ID"
        query={params?.filter}
        getCsv={{
          method: async () => {
            const data = await getStorageProviders(params);
            return {
              data: data.data as never[],
            };
          },
          title: "storage-providers.csv",
          headers: csvHeaders,
        }}
        navigation={tabs}
        selected={tabs[0].value}
        setQuery={(filterString: string) => {
          const filter = filterString.startsWith("f0")
            ? filterString.substring(2)
            : filterString;
          if (params.filter !== filter) {
            patchParams({ filter, page: "1" });
          }
        }}
      />
      <CardContent className="p-0">
        <DataTable columns={columns} data={sps!.data} />
      </CardContent>
      <GenericContentFooter
        page={params?.page}
        limit={params?.limit}
        total={sps?.count ?? "0"}
        patchParams={patchParams}
      />
    </Card>
  );
};

export { StorageProvidersList };
