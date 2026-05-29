"use client";

import { useStorageProviderClientsColumns } from "@/app/storage-providers/(pages)/[id]/components/useStorageProviderClientsColumns";
import {
  fetchStorageProviderClientsList,
  FetchStorageProviderClientsListParameters,
} from "@/app/storage-providers/storage-providers-data";
import { GenericContentHeader } from "@/components/generic-content-view";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Paginator } from "@/components/ui/pagination";
import { QueryKey } from "@/lib/constants";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import { type ComponentProps, useCallback, useEffect } from "react";
import useSWR from "swr";

type CardProps = ComponentProps<typeof Card>;
export interface ClientsListProps extends Omit<CardProps, "children"> {
  providerId: string;
}

const pageKey = "clp";
const limitKey = "cll";
const sortKey = "cls";
const orderKey = "clo";
const filterKey = "clf";

export function ClientsList({ providerId, ...rest }: ClientsListProps) {
  const [page, setPage] = useQueryState(pageKey, parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    limitKey,
    parseAsInteger.withDefault(10)
  );
  const [sort, setSort] = useQueryState(sortKey);
  const [order, setOrder] = useQueryState(
    orderKey,
    parseAsStringEnum(["asc", "desc" as const])
  );
  const [filter, setFilter] = useQueryState(filterKey);

  const handleSort = useCallback(
    (key: string, direction: "asc" | "desc") => {
      setSort(key);
      setOrder(direction);
    },
    [setOrder, setSort]
  );

  const handleFilter = useCallback(
    (query: string) => {
      setFilter(query);
      setPage(1);
    },
    [setFilter, setPage]
  );

  const { columns, csvHeaders } = useStorageProviderClientsColumns({
    sorting: sort ? { key: sort, direction: order ?? "asc" } : undefined,
    onSort: handleSort,
  });

  const parameters: FetchStorageProviderClientsListParameters = {
    providerId,
    page,
    limit,
    filter: filter ?? undefined,
    sort: sort ?? undefined,
    order: order ?? undefined,
  };
  const { data, error, isLoading, mutate } = useSWR(
    [QueryKey.STORAGE_PROVIDER_CLIENTS_LIST, parameters],
    ([, fetchParameters]) => {
      return fetchStorageProviderClientsList(fetchParameters);
    },
    {
      keepPreviousData: true,
      revalidateOnMount: false,
    }
  );

  useEffect(() => {
    if (!data && !error && !isLoading) {
      mutate();
    }
  }, [data, error, isLoading, mutate]);

  return (
    <Card {...rest}>
      <GenericContentHeader
        placeholder="Search by Client ID..."
        fixedHeight={false}
        setQuery={handleFilter}
        header={
          <div>
            <h1 className="text-lg font-medium leading-none font-semibold flex items-center gap-2">
              Verified Clients
            </h1>
          </div>
        }
        getCsv={{
          method: async () => {
            const data = await fetchStorageProviderClientsList({
              providerId,
              sort: sort ?? undefined,
              order: order ?? undefined,
            });
            return {
              data: data.data as never[],
            };
          },
          title: `sp_${providerId}_clients.csv`,
          headers: csvHeaders,
        }}
      />
      <CardContent className="p-0">
        <DataTable columns={columns} data={data?.data ?? []} />
      </CardContent>
      <CardFooter className="border-t w-full p-3">
        <Paginator
          total={data?.pagination.total ?? 0}
          page={page}
          pageSize={limit}
          pageSizeOptions={[10, 15, 25]}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
        />
      </CardFooter>
    </Card>
  );
}
