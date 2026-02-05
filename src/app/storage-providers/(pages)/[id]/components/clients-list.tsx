"use client";

import { useStorageProviderClientsColumns } from "@/app/storage-providers/(pages)/[id]/components/useStorageProviderClientsColumns";
import { GenericContentHeader } from "@/components/generic-content-view";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Paginator } from "@/components/ui/pagination";
import { getStorageProviderById } from "@/lib/api";
import { QueryKey } from "@/lib/constants";
import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback } from "react";
import useSWR from "swr";

export interface ClientsListProps {
  id: string;
}

export function ClientsList({ id }: ClientsListProps) {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10)
  );
  const [sort, setSort] = useQueryState("sort");
  const [filter, setFilter] = useQueryState("filter");

  const handleSort = useCallback(
    (key: string, direction: string) => {
      setSort(`[["${key}",${direction}]]`);
    },
    [setSort]
  );

  const handleFilter = useCallback(
    (query: string) => {
      setFilter(query);
      setPage(1);
    },
    [setFilter, setPage]
  );

  const { columns, csvHeaders } = useStorageProviderClientsColumns(handleSort);
  const { data } = useSWR(
    [
      QueryKey.STORAGE_PROVIDER_BY_ID,
      id,
      { page, limit: pageSize, filter, sort },
    ],
    ([, providerId, searchParams]) => {
      return getStorageProviderById(providerId, searchParams);
    },
    {
      keepPreviousData: true,
    }
  );

  return (
    <Card>
      <GenericContentHeader
        placeholder="Client ID / Address / Name"
        fixedHeight={false}
        setQuery={handleFilter}
        header={
          <div>
            <h1 className="text-2xl text-black leading-none font-semibold flex items-center gap-2">
              Verified Clients
            </h1>
          </div>
        }
        getCsv={{
          method: async () => {
            const data = await getStorageProviderById(id, { filter, sort });
            return {
              data: data.data as never[],
            };
          },
          title: `sp_${id}_clients.csv`,
          headers: csvHeaders,
        }}
      />
      <CardContent className="p-0">
        <DataTable columns={columns} data={data?.data ?? []} />
      </CardContent>
      <CardFooter className="border-t w-full p-3">
        <Paginator
          total={data?.count ?? 0}
          page={page}
          pageSize={pageSize}
          pageSizeOptions={[10, 15, 25]}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </CardFooter>
    </Card>
  );
}
