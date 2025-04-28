import {
  DataTableSort,
  DataTableSortProps,
} from "@/components/data-table-sort";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { IStorageProvider } from "@/lib/interfaces/dmob/sp.interface";
import { calculateDateFromHeight, convertBytesToIEC } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { InfoIcon } from "lucide-react";
import Link from "next/link";

type SortDirection = NonNullable<DataTableSortProps["direction"]>;

interface Sorting {
  key: string;
  direction: SortDirection;
}
export interface UseStorageProvidersColumnsOptions {
  sorting?: Sorting | null;
  onSort(key: string, direction: SortDirection): void;
}

function getSortDirectionForProperty(
  sorting: Sorting | null | undefined,
  property: string
): SortDirection | undefined {
  if (!sorting) {
    return undefined;
  }

  return sorting.key === property ? sorting.direction : undefined;
}

export function useStorageProvidersColumns({
  sorting,
  onSort,
}: UseStorageProvidersColumnsOptions) {
  return [
    {
      accessorKey: "provider",
      header: () => {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "provider")}
            onSort={(direction) => onSort("provider", direction)}
          >
            Storage Provider ID
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const provider = row.getValue("provider") as string;
        return (
          <Link className="table-link" href={`storage-providers/${provider}`}>
            {provider}
          </Link>
        );
      },
    },
    {
      accessorKey: "noOfVerifiedDeals",
      header: () => {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(
              sorting,
              "noOfVerifiedDeals"
            )}
            onSort={(direction) => onSort("noOfVerifiedDeals", direction)}
          >
            Deals
          </DataTableSort>
        );
      },
    },
    {
      accessorKey: "noOfClients",
      header: () => {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "noOfClients")}
            onSort={(direction) => onSort("noOfClients", direction)}
          >
            Number of clients
          </DataTableSort>
        );
      },
    },
    {
      accessorKey: "verifiedDealsTotalSize",
      header: () => {
        return <p>Total Deals Size</p>;
      },
      cell: ({ row }) => {
        const verifiedDealsTotalSize = row.getValue(
          "verifiedDealsTotalSize"
        ) as string;
        return convertBytesToIEC(+verifiedDealsTotalSize);
      },
    },
    {
      accessorKey: "lastDealHeight",
      header: () => {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "lastDealHeight")}
            onSort={(direction) => onSort("lastDealHeight", direction)}
          >
            Last Deal
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const lastDealHeight = row.getValue("lastDealHeight") as number;
        return (
          <div className="whitespace-nowrap flex gap-1 items-center justify-end">
            {calculateDateFromHeight(+lastDealHeight)}
            <HoverCard openDelay={100} closeDelay={50}>
              <HoverCardTrigger asChild>
                <InfoIcon
                  size={15}
                  className="text-muted-foreground cursor-help"
                />
              </HoverCardTrigger>
              <HoverCardContent className="w-32">
                <p>Block height</p>
                <p>{lastDealHeight}</p>
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      },
    },
  ] as ColumnDef<IStorageProvider>[];
}
