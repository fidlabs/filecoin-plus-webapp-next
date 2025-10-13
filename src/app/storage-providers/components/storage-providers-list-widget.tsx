"use client";

import { OverlayLoader } from "@/components/overlay-loader";
import { Card, CardFooter } from "@/components/ui/card";
import { Paginator } from "@/components/ui/pagination";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { cn } from "@/lib/utils";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import {
  fetchStorageProvidersList,
  FetchStorageProvidersListParameters,
} from "../storage-providers-data";
import {
  StorageProvidersList,
  StorageProvidersListProps,
} from "./storage-providers-list";
import { StorageProvidersListAddons } from "./storage-providers-list-addons";

type CardProps = ComponentProps<typeof Card>;
export type StorageProvidersListWidgetProps = Omit<CardProps, "children">;

export function StorageProvidersListWidget(
  props: StorageProvidersListWidgetProps
) {
  const [parameters, setParameters] =
    useState<FetchStorageProvidersListParameters>({});
  const { data, isLoading } = useSWR(
    [QueryKey.STORAGE_PROVIDERS_LIST, parameters],
    ([, fetchParameters]) => fetchStorageProvidersList(fetchParameters),
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 1000);

  const hasData = typeof data !== "undefined";
  const showLoader = !hasData || isLongLoading;

  const sorting: StorageProvidersListProps["sorting"] = useMemo(() => {
    if (
      !parameters.sort ||
      (parameters.order !== "asc" && parameters.order !== "desc")
    ) {
      return null;
    }

    return {
      key: parameters.sort,
      direction: parameters.order,
    };
  }, [parameters.sort, parameters.order]);

  const updateParameters = useCallback(
    (nextPartialParameters: FetchStorageProvidersListParameters) => {
      setParameters((currentParameters) => ({
        ...currentParameters,
        ...nextPartialParameters,
      }));
    },
    []
  );

  const handleSort = useCallback<StorageProvidersListProps["onSort"]>(
    (sort, order) => {
      updateParameters({ sort, order });
    },
    [updateParameters]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParameters({ page });
    },
    [updateParameters]
  );

  const handleSearch = useCallback(
    (searchPhrase: string) => {
      updateParameters({ provider: searchPhrase, page: 1 });
    },
    [updateParameters]
  );

  return (
    <Card {...props}>
      <div className="px-4 pt-6 mb-2 flex flex-wrap gap-4 items-center justify-between">
        <h2 className="text-lg font-medium">Storage Providers List</h2>
        <StorageProvidersListAddons onSearch={handleSearch} />
      </div>

      <div className={cn("relative", showLoader && "min-h-[602px]")}>
        <StorageProvidersList
          storageProviders={data?.storageProviders ?? []}
          sorting={sorting}
          onSort={handleSort}
        />

        {<OverlayLoader show={showLoader} />}
      </div>

      <CardFooter className="border-t w-full p-3">
        <Paginator
          page={parameters.page ?? 1}
          pageSize={parameters.limit ?? 10}
          total={data?.totalCount ?? 0}
          onPageChange={handlePageChange}
        />
      </CardFooter>
    </Card>
  );
}
