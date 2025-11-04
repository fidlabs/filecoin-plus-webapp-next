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
  useRef,
  useState,
  type ComponentProps,
} from "react";
import useSWR from "swr";
import { useDebounceCallback } from "usehooks-ts";
import { fetchClients, FetchClientsParameters } from "../clients-data";
import { useClientsColumns } from "./useClientsColumns";

type CardProps = ComponentProps<typeof Card>;
export interface ClientsListWidgetProps extends Omit<CardProps, "children"> {
  defaultParameters?: FetchClientsParameters;
}

const pageSizeOptions = [10, 25, 50];

export function ClientsListWidget({
  defaultParameters = {},
  ...rest
}: ClientsListWidgetProps) {
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const [parameters, setParameters] = useState(defaultParameters);
  const { data, isLoading } = useSWR(
    [QueryKey.CLIENTS_LIST, parameters],
    ([, fetchParameters]) => fetchClients(fetchParameters),
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 1000);

  const scrollToListTop = useCallback(() => {
    if (widgetRef.current) {
      widgetRef.current.scrollIntoView({
        block: "start",
      });
    }
  }, []);

  const handleSearch = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const filter = event.target.value;

      setParameters((currentParameters) => ({
        ...currentParameters,
        filter,
        page: 1,
      }));
    },
    []
  );
  const handleSearchDebounced = useDebounceCallback(handleSearch, 150);

  const handleClearSearch = useCallback(() => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      filter: undefined,
      page: 1,
    }));
  }, []);

  const handleSort = useCallback((key: string, direction: "asc" | "desc") => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      sort: {
        key,
        direction,
      },
    }));
  }, []);

  const handlePageChange = useCallback<PaginatorProps["onPageChange"]>(
    (page) => {
      setParameters((currentParameters) => ({
        ...currentParameters,
        page,
      }));

      scrollToListTop();
    },
    [scrollToListTop]
  );

  const handlePageSizeChange = useCallback<
    NonNullable<PaginatorProps["onPageSizeChange"]>
  >((limit) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      limit,
    }));
  }, []);

  const columns = useClientsColumns({
    sorting: parameters.sort,
    onSort: handleSort,
  });

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
              value={parameters.filter}
              onChange={handleSearchDebounced}
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
          total={data?.count ? parseInt(data.count, 10) : 0}
        />
      </CardFooter>
    </Card>
  );
}
