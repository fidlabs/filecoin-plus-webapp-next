"use client";

import {
  StorageProvidersList,
  StorageProvidersListProps,
} from "@/app/storage-providers/components/storage-providers-list";
import { FetchStorageProvidersListReturnType } from "@/app/storage-providers/storage-providers-data";
import { GenericContentFooter } from "@/components/generic-content-view";
import { Card } from "@/components/ui/card";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { useCallback, useMemo } from "react";
import {
  StorageProvidersComplianceFilters,
  StorageProvidersComplianceFiltersProps,
} from "./storage-providers-compliance-filters";

export interface StorageProvidersComplianceListWidgetProps {
  selectedWeek: StorageProvidersComplianceFiltersProps["selectedWeek"];
  storageProvidersList: FetchStorageProvidersListReturnType;
  weeks: StorageProvidersComplianceFiltersProps["weeks"];
}

export function StorageProvidersComplianceListWidget({
  selectedWeek,
  storageProvidersList,
  weeks,
}: StorageProvidersComplianceListWidgetProps) {
  const { filters, updateFilters } = useSearchParamsFilters();
  const sorting: StorageProvidersListProps["sorting"] = useMemo(() => {
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

  const handleSort = useCallback<StorageProvidersListProps["onSort"]>(
    (sort, order) => {
      updateFilters({ sort, order });
    },
    [updateFilters]
  );

  return (
    <Card>
      <div className="px-4 pt-6 mb-6">
        <h2 className="text-lg font-medium">Storage Providers List</h2>
        <p className="text-xs text-muted-foreground">
          Select metrics and adjust filter below to update the list
        </p>
      </div>

      <StorageProvidersComplianceFilters
        selectedWeek={selectedWeek}
        weeks={weeks}
      />

      <StorageProvidersList
        storageProviders={storageProvidersList.storageProviders}
        sorting={sorting}
        onSort={handleSort}
      />

      <GenericContentFooter
        page={filters.page ?? "1"}
        limit={filters.limit ?? "10"}
        total={storageProvidersList.totalCount.toString()}
        patchParams={updateFilters}
      />
    </Card>
  );
}
