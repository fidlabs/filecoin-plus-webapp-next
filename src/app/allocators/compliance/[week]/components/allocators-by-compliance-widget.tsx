"use client";

import { FetchAllocatorsByComplianceReturnType } from "@/app/allocators/allocators-data";
import {
  AllocatorsList,
  AllocatorsListProps,
} from "@/app/allocators/components/allocators-list";
import { Card } from "@/components/ui/card";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { useCallback, useMemo } from "react";
import { AllocatorsComplianceFilters } from "./allocators-compliance-filters";
import { Week } from "@/lib/weeks";

export interface AllocatorsByComplianceWidgetProps {
  data: FetchAllocatorsByComplianceReturnType;
  selectedWeek: Week;
  weeks: Week[];
}

export function AllocatorsByComplianceWidget({
  data,
  selectedWeek,
  weeks,
}: AllocatorsByComplianceWidgetProps) {
  const { filters, updateFilters } = useSearchParamsFilters();

  const sorting = useMemo<AllocatorsListProps["sorting"]>(() => {
    if (!filters.sort) {
      return null;
    }

    return {
      key: filters.sort,
      direction: filters.order === "desc" ? "desc" : "asc",
    };
  }, [filters]);

  const handleSort = useCallback<AllocatorsListProps["onSort"]>(
    (sort, order) => {
      updateFilters({
        sort,
        order,
      });
    },
    [updateFilters]
  );

  return (
    <Card>
      <div className="px-4 pt-6 mb-2">
        <h2 className="text-lg font-medium">Allocators List</h2>
        <p className="text-xs text-muted-foreground mb-6">
          Select metrics and adjust filters below to update the list
        </p>
        <AllocatorsComplianceFilters
          selectedWeek={selectedWeek}
          weeks={weeks}
        />
      </div>

      <AllocatorsList
        allocators={data.data}
        sorting={sorting}
        onSort={handleSort}
      />
    </Card>
  );
}
