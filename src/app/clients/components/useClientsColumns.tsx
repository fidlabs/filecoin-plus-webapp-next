import {
  DataTableSort,
  DataTableSortProps,
} from "@/components/data-table-sort";
import { GithubIcon } from "@/components/icons/github.icon";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { type IClient } from "@/lib/interfaces/dmob/client.interface";
import { calculateDateFromHeight, convertBytesToIEC } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { InfoIcon } from "lucide-react";
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

export function useClientsColumns({
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
            Verified Client ID
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const addressId = row.getValue("addressId") as string;
        const allowanceArraySorted = row.original.allowanceArray.sort(
          (a, b) => +b.height - +a.height
        );
        const githubLink = allowanceArraySorted.find((entry) => {
          return typeof entry.auditTrail === "string";
        })?.auditTrail;

        return (
          <div className="flex gap-1 items-center">
            <Link className="table-link" href={`clients/${addressId}`}>
              {addressId}
            </Link>
            {githubLink && (
              <Link
                className="text-gray-500 hover:text-gray-900"
                target="_blank"
                href={githubLink}
              >
                <GithubIcon width={15} height={15} />
              </Link>
            )}
          </div>
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
            Client name
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
                <Link className="table-link" href={`clients/${addressId}`}>
                  {name.slice(0, 20)}...
                </Link>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">{name}</HoverCardContent>
            </HoverCard>
          );
        } else {
          return (
            <Link className="table-link" href={`clients/${addressId}`}>
              {name}
            </Link>
          );
        }
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
            DataCap received
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const initialAllowance = row.getValue("initialAllowance") as string;
        const allowanceArray = row.original.allowanceArray;
        return (
          <div className="whitespace-nowrap flex gap-1 items-center">
            {convertBytesToIEC(initialAllowance)}
            {allowanceArray?.length > 0 && (
              <HoverCard openDelay={100} closeDelay={50}>
                <HoverCardTrigger asChild>
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
    {
      accessorKey: "remainingDatacap",
      header: () => {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "remainingDatacap")}
            onSort={(direction) => onSort("remainingDatacap", direction)}
          >
            DataCap Remaining
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const remainingDatacap = row.getValue("remainingDatacap") as string;
        return convertBytesToIEC(remainingDatacap);
      },
    },
    {
      accessorKey: "usedDatacapChange",
      header: () => {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(
              sorting,
              "usedDatacapChange"
            )}
            onSort={(direction) => onSort("usedDatacapChange", direction)}
          >
            DC Used (2 Weeks)
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const usedDatacapChange = row.getValue("usedDatacapChange") as string;
        return convertBytesToIEC(usedDatacapChange);
      },
    },
    {
      accessorKey: "usedDatacapChange90Days",
      header: () => {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(
              sorting,
              "usedDatacapChange90Days"
            )}
            onSort={(direction) => onSort("usedDatacapChange90Days", direction)}
          >
            DC Used (90 days)
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const usedDatacapChange = row.getValue(
          "usedDatacapChange90Days"
        ) as string;
        return convertBytesToIEC(usedDatacapChange);
      },
    },
  ] as ColumnDef<IClient>[];
}
