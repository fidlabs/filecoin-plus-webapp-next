import {
  DataTableSort,
  DataTableSortProps,
} from "@/components/data-table-sort";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { IAllocator } from "@/lib/interfaces/dmob/allocator.interface";
import { calculateDateFromHeight, convertBytesToIEC } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
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
    {
      accessorKey: "addressId",
      header: () => {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "addressId")}
            onSort={(direction) => onSort("addressId", direction)}
          >
            Allocator ID
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const addressId = row.getValue("addressId") as string;
        return (
          <Link className="table-link" href={`/allocators/${addressId}`}>
            {addressId}
          </Link>
        );
      },
    },
    {
      accessorKey: "name",
      header: () => {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "name")}
            onSort={(direction) => onSort("name", direction)}
          >
            Name
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const addressId = row.getValue("addressId") as string;
        const name = row.getValue("name") as string;
        if (name?.length > 20) {
          return (
            <HoverCard openDelay={100} closeDelay={50}>
              <HoverCardTrigger asChild>
                <Link className="table-link" href={`allocators/${addressId}`}>
                  {name.slice(0, 20)}...
                </Link>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">{name}</HoverCardContent>
            </HoverCard>
          );
        } else {
          return (
            <Link className="table-link" href={`allocators/${addressId}`}>
              {name}
            </Link>
          );
        }
      },
    },
    {
      accessorKey: "orgName",
      header: () => {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "orgName")}
            onSort={(direction) => onSort("orgName", direction)}
          >
            Organization Name
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const orgName = row.getValue("orgName") as string;
        if (orgName?.length > 20) {
          return (
            <HoverCard openDelay={100} closeDelay={50}>
              <HoverCardTrigger asChild>
                <p className="cursor-help">{orgName.slice(0, 20)}...</p>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">{orgName}</HoverCardContent>
            </HoverCard>
          );
        } else {
          return <p>{orgName}</p>;
        }
      },
    },
    {
      accessorKey: "verifiedClientsCount",
      header: () => {
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
      cell: ({ row }) => {
        const verifiedClientsCount = row.getValue(
          "verifiedClientsCount"
        ) as string;
        return (
          <p className="whitespace-nowrap flex gap-1 items-center">
            {verifiedClientsCount}
          </p>
        );
      },
    },
    {
      accessorKey: "address",
      header: () => {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "address")}
            onSort={(direction) => onSort("address", direction)}
          >
            Address
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const address = row.getValue("address") as string;
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
    },
    {
      accessorKey: "createdAtHeight",
      header: () => {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "createdAtHeight")}
            onSort={(direction) => onSort("createdAtHeight", direction)}
          >
            Create date
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const createdAtHeight = row.getValue("createdAtHeight") as string;
        return (
          <div className="whitespace-nowrap flex gap-1 items-center">
            {calculateDateFromHeight(+createdAtHeight)}
            <HoverCard openDelay={100} closeDelay={50}>
              <HoverCardTrigger>
                <InfoIcon
                  size={15}
                  className="text-muted-foreground cursor-help"
                />
              </HoverCardTrigger>
              <HoverCardContent className="w-32">
                <p>Block height</p>
                <p>{createdAtHeight}</p>
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      },
    },
    {
      accessorKey: "allowance",
      header: () => {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "allowance")}
            onSort={(direction) => onSort("allowance", direction)}
          >
            DataCap Available
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const allowance = row.getValue("allowance") as string;
        return convertBytesToIEC(allowance);
      },
    },
    {
      accessorKey: "remainingDatacap",
      header: () => {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "remainingDatacap")}
            onSort={(direction) => onSort("remainingDatacap", direction)}
          >
            Used DataCap
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const remainingDatacap = row.getValue("remainingDatacap") as string;
        return convertBytesToIEC(remainingDatacap);
      },
    },
    {
      accessorKey: "initialAllowance",
      header: () => {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "initialAllowance")}
            onSort={(direction) => onSort("initialAllowance", direction)}
          >
            Total DataCap received
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const initialAllowance = row.getValue("initialAllowance") as string;
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
                      <div key={index} className="grid grid-cols-7 gap-2">
                        <div className="col-span-2 text-right">
                          {convertBytesToIEC(allowance.allowance)}
                        </div>
                        <div className="col-span-5 text-sm text-muted-foreground">
                          ({calculateDateFromHeight(+allowance.height)})
                        </div>
                      </div>
                    );
                  })}
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
        );
      },
    },
  ] as ColumnDef<IAllocator>[];
}
