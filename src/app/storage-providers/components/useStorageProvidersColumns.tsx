import {
  DataTableSort,
  type DataTableSortProps,
} from "@/components/data-table-sort";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { type IStorageProvider } from "@/lib/interfaces/dmob/sp.interface";
import { calculateDateFromHeight } from "@/lib/utils";
import { createColumnHelper } from "@tanstack/react-table";
import { filesize } from "filesize";
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

const columnHelper = createColumnHelper<IStorageProvider>();
const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

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
    columnHelper.accessor("provider", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "provider")}
            onSort={(direction) => onSort("provider", direction)}
          >
            Storage Provider ID
          </DataTableSort>
        );
      },
      cell({ getValue }) {
        const provider = getValue();

        return (
          <Link className="table-link" href={`/storage-providers/${provider}`}>
            {provider}
          </Link>
        );
      },
    }),
    columnHelper.accessor("noOfVerifiedDeals", {
      header() {
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
    }),
    columnHelper.accessor("noOfClients", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "noOfClients")}
            onSort={(direction) => onSort("noOfClients", direction)}
          >
            Number of clients
          </DataTableSort>
        );
      },
    }),
    columnHelper.accessor("verifiedDealsTotalSize", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(
              sorting,
              "verifiedDealsTotalSize"
            )}
            onSort={(direction) => onSort("verifiedDealsTotalSize", direction)}
          >
            Total Deals Size
          </DataTableSort>
        );
      },
      cell({ getValue }) {
        return filesize(getValue(), { standard: "iec" });
      },
    }),
    columnHelper.accessor("urlFinderRetrievability", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(
              sorting,
              "urlFinderRetrievability"
            )}
            onSort={(direction) => onSort("urlFinderRetrievability", direction)}
          >
            Current RPA
          </DataTableSort>
        );
      },
      cell({ getValue }) {
        const value = getValue();
        return value === null ? "N/A" : percentageFormatter.format(value);
      },
    }),
    columnHelper.accessor("urlFinderRetrievability30DayAverage", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(
              sorting,
              "urlFinderRetrievability30DayAverage"
            )}
            onSort={(direction) =>
              onSort("urlFinderRetrievability30DayAverage", direction)
            }
          >
            30D Average RPA
          </DataTableSort>
        );
      },
      cell({ getValue }) {
        return percentageFormatter.format(getValue());
      },
    }),
    columnHelper.accessor("lastDealHeight", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "lastDealHeight")}
            onSort={(direction) => onSort("lastDealHeight", direction)}
          >
            Last Deal
          </DataTableSort>
        );
      },
      cell({ getValue }) {
        const lastDealHeight = getValue();
        return (
          <div className="whitespace-nowrap flex gap-1 items-center justify-end">
            {calculateDateFromHeight(lastDealHeight)}
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
    }),
  ];
}
