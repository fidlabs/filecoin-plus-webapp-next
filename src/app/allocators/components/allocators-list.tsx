"use client";

import {
  useAllocatorsColumns,
  type UseAllocatorsColumnsOptions,
} from "@/app/allocators/components/useAllocatorsColumns";
import { DataTable } from "@/components/ui/data-table";
import { FetchAllocatorsReturnType } from "../allocators-data";

export interface AllocatorsListProps {
  allocators: FetchAllocatorsReturnType["data"];
  sorting: UseAllocatorsColumnsOptions["sorting"];
  onSort(key: string, direction: "asc" | "desc"): void;
}

export function AllocatorsList({
  allocators,
  sorting,
  onSort,
}: AllocatorsListProps) {
  const columns = useAllocatorsColumns({
    sorting,
    onSort,
  });

  return <DataTable columns={columns} data={allocators} />;
}
