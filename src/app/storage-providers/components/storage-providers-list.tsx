"use client";

import {
  useStorageProvidersColumns,
  UseStorageProvidersColumnsOptions,
} from "@/app/storage-providers/components/useStorageProvidersColumns";
import { GenericContentFooter } from "@/components/generic-content-view";
import { DataTable } from "@/components/ui/data-table";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { useCallback, useMemo } from "react";

interface StorageProvidersListProps {
  storageProviders: Array<{
    provider: string;
    noOfVerifiedDeals: number;
    noOfClients: number;
    verifiedDealsTotalSize: string;
    lastDealHeight: number;
  }>;
  totalCount: number;
}

export function StorageProvidersList({
  storageProviders,
  totalCount,
}: StorageProvidersListProps) {
  const { filters, updateFilters } = useSearchParamsFilters();

  const sorting: UseStorageProvidersColumnsOptions["sorting"] = useMemo(() => {
    if (
      !filters.sort ||
      (filters.order !== "asc" && filters.order !== "desc")
    ) {
      return null;
    }

    return {
      key: filters.sort,
      direction: filters.order,
    };
  }, [filters.sort, filters.order]);

  const handleSort = useCallback(
    (key: string, direction: string) => {
      updateFilters({
        sort: key,
        order: direction,
      });
    },
    [updateFilters]
  );

  const columns = useStorageProvidersColumns({
    sorting,
    onSort: handleSort,
  });

  return (
    <div>
      <DataTable columns={columns} data={storageProviders} />
      <GenericContentFooter
        page={filters.page ?? "1"}
        limit={filters.limit ?? "10"}
        total={String(totalCount)}
        patchParams={updateFilters}
      />
    </div>
  );
}
