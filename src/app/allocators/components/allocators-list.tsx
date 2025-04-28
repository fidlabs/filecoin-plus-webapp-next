"use client";

import {
  useAllocatorsColumns,
  type UseAllocatorsColumnsOptions,
} from "@/app/allocators/components/useAllocatorsColumns";
import { GenericContentFooter } from "@/components/generic-content-view";
import { CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { IAllocatorsResponse } from "@/lib/interfaces/dmob/allocator.interface";
import { useCallback, useMemo } from "react";

interface AllocatorsListProps {
  allocatorsResponse: IAllocatorsResponse;
}

export function AllocatorsList({ allocatorsResponse }: AllocatorsListProps) {
  const { filters, updateFilters } = useSearchParamsFilters();

  const sorting: UseAllocatorsColumnsOptions["sorting"] = useMemo(() => {
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

  const columns = useAllocatorsColumns({
    sorting,
    onSort: handleSort,
  });

  return (
    <>
      <CardContent className="p-0">
        <DataTable columns={columns} data={allocatorsResponse.data} />
      </CardContent>
      <GenericContentFooter
        page={filters.page ?? "1"}
        limit={filters.limit ?? "10"}
        total={String(allocatorsResponse.count)}
        patchParams={updateFilters}
      />
    </>
  );
}
