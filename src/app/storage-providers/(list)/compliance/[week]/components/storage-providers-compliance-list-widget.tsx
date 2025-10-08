"use client";

import {
  StorageProvidersList,
  StorageProvidersListProps,
} from "@/app/storage-providers/components/storage-providers-list";
import { StorageProvidersListAddons } from "@/app/storage-providers/components/storage-providers-list-addons";
import { FetchStorageProvidersListReturnType } from "@/app/storage-providers/storage-providers-data";
import { GenericContentFooter } from "@/components/generic-content-view";
import { Card } from "@/components/ui/card";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { useCallback, useMemo } from "react";
import {
  StorageProvidersComplianceFilters,
  StorageProvidersComplianceFiltersProps,
} from "./storage-providers-compliance-filters";

const longLoadingDelayMs = 1000;

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

  const page = maybeStringToInt(filters.page, 1);
  const limit = maybeStringToInt(filters.page, 10);

  const handleSort = useCallback<StorageProvidersListProps["onSort"]>(
    (sort, order) => {
      updateFilters({ sort, order });
    },
    [updateFilters]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateFilters({ page: page.toString() });
    },
    [updateFilters]
  );

  const handleSearch = useCallback(
    (searchPhrase: string) => {
      updateFilters({ provider: searchPhrase });
    },
    [updateFilters]
  );

  return (
    <Card>
      <div className="px-4 pt-6 mb-2">
        <h2 className="text-lg font-medium mb-4">Storage Providers List</h2>

        <div className="flex flex-wrap gap-4 justify-between">
          <StorageProvidersComplianceFilters
            selectedWeek={selectedWeek}
            weeks={weeks}
          />

          <StorageProvidersListAddons onSearch={handleSearch} />
        </div>
      </div>

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

function maybeStringToInt(
  input: string | undefined,
  defaultValue: number
): number {
  if (typeof input !== "string") {
    return defaultValue;
  }

  const numericValue = parseInt(input, 10);
  return isNaN(numericValue) ? defaultValue : numericValue;
}
