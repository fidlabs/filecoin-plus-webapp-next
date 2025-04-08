"use client";
import {
  GenericContentFooter,
  GenericContentHeader,
} from "@/components/generic-content-view";
import { getStorageProviderById } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useStorageProviderClientsColumns } from "@/app/storage-providers/(pages)/[id]/components/useStorageProviderClientsColumns";
import { IStorageProviderResponse } from "@/lib/interfaces/dmob/sp.interface";
import { IApiQuery } from "@/lib/interfaces/api.interface";
import { useParamsQuery } from "@/lib/hooks/useParamsQuery";

interface IClientsListProps {
  data: IStorageProviderResponse;
  id: string;
  params: IApiQuery;
}

const ClientsList = ({ data, params, id }: IClientsListProps) => {
  const { patchParams } = useParamsQuery(params);

  const { columns, csvHeaders } = useStorageProviderClientsColumns(
    (key, direction) => patchParams({ sort: `[["${key}",${direction}]]` })
  );

  return (
    <Card>
      <GenericContentHeader
        placeholder="Client ID / Address / Name"
        fixedHeight={false}
        setQuery={(filter: string) => patchParams({ filter })}
        header={
          <div>
            <h1 className="text-2xl text-black leading-none font-semibold flex items-center gap-2">
              <p>{data?.count}</p>
              <p>Verified clients</p>
            </h1>
          </div>
        }
        getCsv={{
          method: async () => {
            const data = await getStorageProviderById(id, params);
            return {
              data: data.data as never[],
            };
          },
          title: `sp_${id}_clients.csv`,
          headers: csvHeaders,
        }}
      />
      <CardContent className="p-0">
        <DataTable columns={columns} data={data!.data} />
      </CardContent>
      <GenericContentFooter
        page={params?.page}
        limit={params?.limit}
        total={data?.count ?? "0"}
        patchParams={patchParams}
      />
    </Card>
  );
};

export { ClientsList };
