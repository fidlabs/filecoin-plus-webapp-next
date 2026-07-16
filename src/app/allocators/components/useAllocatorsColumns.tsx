import {
  DataTableSort,
  DataTableSortProps,
} from "@/components/data-table-sort";
import { StringShortener } from "@/components/string-shortener";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { type IAllocator } from "@/lib/interfaces/dmob/allocator.interface";
import {
  calculateDateFromHeight,
  calculateTimestampFromHeight,
  convertBytesToIEC,
} from "@/lib/utils";
import { createColumnHelper } from "@tanstack/react-table";
import { CopyIcon, InfoIcon } from "lucide-react";
import Link from "next/link";

type SortDirection = NonNullable<DataTableSortProps["direction"]>;

interface Sorting {
  key: string;
  direction: SortDirection;
}
export interface UseAllocatorsColumnsOptions {
  sorting?: Sorting | null;
  onSort(key: string, direction: SortDirection): void;
}

const columnHelper = createColumnHelper<IAllocator>();
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
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

export function useAllocatorsColumns({
  sorting,
  onSort,
}: UseAllocatorsColumnsOptions) {
  return [
    columnHelper.accessor("addressId", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "addressId")}
            onSort={(direction) => onSort("addressId", direction)}
          >
            Allocator ID
          </DataTableSort>
        );
      },
      cell({ getValue }) {
        const addressId = getValue();
        return (
          <Link className="table-link" href={`/allocators/${addressId}`}>
            {addressId}
          </Link>
        );
      },
    }),
    columnHelper.accessor("name", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "name")}
            onSort={(direction) => onSort("name", direction)}
          >
            Name
          </DataTableSort>
        );
      },
      cell({ getValue, row }) {
        const addressId = row.original.addressId;
        const name = getValue();

        return (
          <Link className="table-link" href={`/allocators/${addressId}`}>
            <StringShortener value={name ?? ""} maxLength={20} />
          </Link>
        );
      },
    }),
    columnHelper.accessor("orgName", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "orgName")}
            onSort={(direction) => onSort("orgName", direction)}
          >
            Organization
          </DataTableSort>
        );
      },
      cell: ({ getValue }) => {
        return <StringShortener value={getValue() ?? ""} maxLength={20} />;
      },
    }),
    columnHelper.accessor("verifiedClientsCount", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(
              sorting,
              "verifiedClientsCount"
            )}
            onSort={(direction) => onSort("verifiedClientsCount", direction)}
          >
            Verified Clients
          </DataTableSort>
        );
      },
    }),
    columnHelper.accessor("address", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "address")}
            onSort={(direction) => onSort("address", direction)}
          >
            Address
          </DataTableSort>
        );
      },
      cell({ getValue }) {
        const address = getValue();
        const addressShort = `${address.slice(0, 4)}...${address.slice(-4)}`;
        return (
          <div className="flex gap-2 items-center">
            <p className="whitespace-nowrap">{addressShort}</p>
            <button onClick={() => navigator.clipboard.writeText(address)}>
              <CopyIcon size={15} className="text-muted-foreground" />
            </button>
          </div>
        );
      },
    }),
    columnHelper.accessor("createdAtHeight", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "createdAtHeight")}
            onSort={(direction) => onSort("createdAtHeight", direction)}
          >
            Create date
          </DataTableSort>
        );
      },
      cell({ getValue }) {
        const height = getValue();
        const date = new Date(calculateTimestampFromHeight(height) * 1000);

        return (
          <div className="flex items-center gap-1">
            {dateFormatter.format(date)}
            <HoverCard openDelay={100} closeDelay={50}>
              <HoverCardTrigger>
                <InfoIcon
                  size={15}
                  className="text-muted-foreground cursor-help"
                />
              </HoverCardTrigger>
              <HoverCardContent className="text-left max-w-fit">
                Block Height <strong>{height}</strong>
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      },
    }),
    columnHelper.accessor("allowance", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "allowance")}
            onSort={(direction) => onSort("allowance", direction)}
          >
            Available DC
          </DataTableSort>
        );
      },
      cell({ getValue }) {
        return convertBytesToIEC(getValue());
      },
    }),
    columnHelper.accessor("remainingDatacap", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "remainingDatacap")}
            onSort={(direction) => onSort("remainingDatacap", direction)}
          >
            Used DC
          </DataTableSort>
        );
      },
      cell({ getValue }) {
        return convertBytesToIEC(getValue());
      },
    }),
    columnHelper.accessor("initialAllowance", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "initialAllowance")}
            onSort={(direction) => onSort("initialAllowance", direction)}
          >
            Received DC
          </DataTableSort>
        );
      },
      cell({ getValue, row }) {
        const initialAllowance = getValue();
        const allowanceArray = row.original.allowanceArray;
        return (
          <div className="whitespace-nowrap flex gap-1 items-center">
            {convertBytesToIEC(initialAllowance)}
            {!!allowanceArray?.length && (
              <HoverCard openDelay={100} closeDelay={50}>
                <HoverCardTrigger>
                  <InfoIcon
                    size={15}
                    className="text-muted-foreground cursor-help"
                  />
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  {allowanceArray.map((allowance, index) => {
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 justify-center"
                      >
                        <span>{convertBytesToIEC(allowance.allowance)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({calculateDateFromHeight(+allowance.height)})
                        </span>
                      </div>
                    );
                  })}
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("latestClientAllocationHeight", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(
              sorting,
              "latestClientAllocationHeight"
            )}
            onSort={(direction) =>
              onSort("latestClientAllocationHeight", direction)
            }
          >
            Latest Allocation
          </DataTableSort>
        );
      },
      cell({ getValue }) {
        const height = getValue();

        if (height === null) {
          return "-";
        }

        const date = new Date(calculateTimestampFromHeight(height) * 1000);

        return (
          <div className="flex items-center justify-end gap-1">
            {dateFormatter.format(date)}
            <HoverCard openDelay={100} closeDelay={50}>
              <HoverCardTrigger>
                <InfoIcon
                  size={15}
                  className="text-muted-foreground cursor-help"
                />
              </HoverCardTrigger>
              <HoverCardContent align="end" className="text-left max-w-fit">
                Block Height <strong>{height}</strong>
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      },
    }),
  ];
}
