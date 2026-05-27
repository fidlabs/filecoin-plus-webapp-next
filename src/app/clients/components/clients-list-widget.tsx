"use client";

import { OverlayLoader } from "@/components/overlay-loader";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Paginator, PaginatorProps } from "@/components/ui/pagination";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { XIcon } from "lucide-react";
import {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import useSWR from "swr";
import { useDebounceCallback } from "usehooks-ts";
import { fetchClients, FetchClientsParameters } from "../clients-data";
import { useClientsColumns } from "./useClientsColumns";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";

type CardProps = ComponentProps<typeof Card>;
export interface ClientsListWidgetProps extends Omit<CardProps, "children"> {
  defaultParameters?: FetchClientsParameters;
}

const pageSizeOptions = [10, 25, 50];

const pageKey = "clp";
const limitKey = "cll";
const sortKey = "cls";
const orderKey = "clo";
const filterKey = "clf";

export function ClientsListWidget({
  defaultParameters = {},
  ...rest
}: ClientsListWidgetProps) {
  const [page, setPage] = useQueryState(
    pageKey,
    defaultParameters.page
      ? parseAsInteger.withDefault(defaultParameters.page)
      : parseAsInteger
  );

  const [limit, setLimit] = useQueryState(
    limitKey,
    defaultParameters.page
      ? parseAsInteger.withDefault(defaultParameters.limit)
      : parseAsInteger
  );

  const [sort, setSort] = useQueryState(sortKey);

  const [order, setOrder] = useQueryState(
    orderKey,
    parseAsStringEnum(["asc", "desc"] as const)
  );

  const [filter, setFilter] = useQueryState(filterKey);

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const [searchPhrase, setSearchPhrase] = useState("");
  const nonPaginationParameters: Omit<
    FetchClientsParameters,
    "page" | "limit"
  > = {
    filter: filter ?? undefined,
    sort: sort ?? undefined,
    order: order ?? undefined,
  };
  const parameters: FetchClientsParameters =
    page !== null && limit !== null
      ? {
          ...nonPaginationParameters,
          page,
          limit,
        }
      : nonPaginationParameters;

  const { data, isLoading } = useSWR(
    [QueryKey.CLIENTS_LIST, parameters],
    ([, fetchParameters]) => fetchClients(fetchParameters),
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const scrollToListTop = useCallback(() => {
    if (widgetRef.current) {
      widgetRef.current.scrollIntoView({
        block: "start",
      });
    }
  }, []);

  const handleSearchPhraseChange = useCallback<
    ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setSearchPhrase(event.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchPhrase("");
  }, []);

  const handleSearch = useCallback(
    (filter: string) => {
      setPage(1);
      setFilter(filter);
    },
    [setFilter, setPage]
  );
  const handleSearchDebounced = useDebounceCallback(handleSearch, 150);

  const handleSort = useCallback(
    (sort: string, order: "asc" | "desc") => {
      setSort(sort);
      setOrder(order);
    },
    [setOrder, setSort]
  );

  const handlePageChange = useCallback<PaginatorProps["onPageChange"]>(
    (page) => {
      setPage(page);
      scrollToListTop();
    },
    [scrollToListTop, setPage]
  );

  const handlePageSizeChange = useCallback<
    NonNullable<PaginatorProps["onPageSizeChange"]>
  >(
    (limit) => {
      setLimit(limit);
    },
    [setLimit]
  );

  const columns = useClientsColumns({
    sorting: parameters.sort
      ? {
          key: parameters.sort,
          direction: parameters.order ?? "desc",
        }
      : undefined,
    onSort: handleSort,
  });

  useEffect(() => {
    handleSearchDebounced(searchPhrase);
  }, [handleSearchDebounced, searchPhrase]);

  return (
    <Card {...rest} ref={widgetRef}>
      <div className="px-4 pt-6 mb-2 gap-4 flex flex-wrap items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Clients List</h2>
          <p className="text-xs text-muted-foreground">
            Browse Clients participating in Filecoin. Select to see details.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative w-[270px] ">
            <Input
              className="bg-background w-full text-sm"
              placeholder="Search by ID / Address / Name"
              value={searchPhrase}
              onChange={handleSearchPhraseChange}
            />
            {parameters.filter && parameters.filter.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0"
                onClick={handleClearSearch}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="relative min-h-[200px]">
        <DataTable data={data ? data.data : []} columns={columns} />
        <OverlayLoader show={!data || isLongLoading} />
      </div>

      <CardFooter className="border-t w-full p-3">
        <Paginator
          page={parameters.page ?? 1}
          pageSize={parameters.limit ?? pageSizeOptions[0]}
          pageSizeOptions={pageSizeOptions}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          total={data?.pagination.total ?? 0}
        />
      </CardFooter>
    </Card>
  );
}
