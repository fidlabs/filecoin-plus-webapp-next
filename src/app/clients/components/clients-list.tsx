"use client";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { IClientsQuery } from "@/lib/interfaces/api.interface";
import {
  GenericContentFooter,
  GenericContentHeader,
} from "@/components/generic-content-view";
import { InfoIcon } from "lucide-react";
import { getClients } from "@/lib/api";
import { useParamsQuery } from "@/lib/hooks/useParamsQuery";
import { useClientsColumns } from "@/app/clients/components/useClientsColumns";
import { ClientsStats } from "@/app/clients/components/clients-stats";
import { IClientsResponse } from "@/lib/interfaces/dmob/client.interface";

interface ClientsListProps {
  clients: IClientsResponse;
  params: IClientsQuery;
}

const ClientsList = ({ clients, params }: ClientsListProps) => {
  const { patchParams } = useParamsQuery(params);

  const { columns, csvHeaders } = useClientsColumns((key, direction) =>
    patchParams({ sort: `[["${key}",${direction}]]` })
  );

  return (
    <div>
      <ClientsStats data={clients} />
      <Card className="mt-4">
        <GenericContentHeader
          placeholder="Client ID / Address / Name"
          query={params?.filter}
          getCsv={{
            method: async () => {
              const data = await getClients(params);
              return {
                data: data.data as never[],
              };
            },
            title: "clients.csv",
            headers: csvHeaders,
          }}
          header={
            <div className="flex flex-row gap-6 items-baseline">
              <h1 className="text-2xl text-black leading-none font-semibold flex items-center gap-2">
                <p>{clients?.count}</p>
                <p>{+(clients?.count ?? 0) === 1 ? "Client" : "Clients"}</p>
              </h1>
            </div>
          }
          setQuery={(filter: string) => patchParams({ filter, page: "1" })}
        />
        <CardContent className="p-0 m-0 border-b bg-[#F2F9FF]">
          <div className="flex items-center px-6 py-2 gap-3">
            <InfoIcon className="w-5 h-5 bg-[#475A6E] rounded-full text-white flex flex-col items-center justify-center" />
            <p className="text-sm">
              Note: Clients that receive automatic DataCap allocations from the
              verify.glif.io site maintained by the Infinite Scroll allocator
              are marked as &quot;Glif auto verified.&quot;
            </p>
          </div>
        </CardContent>
        <CardContent className="p-0">
          <DataTable columns={columns} data={clients!.data} />
        </CardContent>
        <GenericContentFooter
          page={params?.page}
          limit={params?.limit}
          total={clients?.count.toString() ?? "0"}
          patchParams={patchParams}
        />
      </Card>
    </div>
  );
};

export { ClientsList };
