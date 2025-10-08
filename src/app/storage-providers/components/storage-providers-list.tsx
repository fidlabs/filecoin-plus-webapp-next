"use client";

import {
  useStorageProvidersColumns,
  UseStorageProvidersColumnsOptions,
} from "@/app/storage-providers/components/useStorageProvidersColumns";
import { DataTable } from "@/components/ui/data-table";

type Sorting = UseStorageProvidersColumnsOptions["sorting"];

export interface StorageProvidersListProps {
  sorting: Sorting;
  storageProviders: Array<{
    provider: string;
    noOfVerifiedDeals: number;
    noOfClients: number;
    verifiedDealsTotalSize: string;
    lastDealHeight: number;
  }>;
  onSort(key: string, direction: "asc" | "desc"): void;
}

export function StorageProvidersList({
  sorting,
  storageProviders,
  onSort,
}: StorageProvidersListProps) {
  const columns = useStorageProvidersColumns({
    sorting,
    onSort,
  });

  return <DataTable columns={columns} data={storageProviders} />;
}
