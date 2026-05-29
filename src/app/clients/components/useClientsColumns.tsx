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
import { createColumnHelper } from "@tanstack/react-table";
import { filesize } from "filesize";
import Link from "next/link";
import { FetchClientsReturnType } from "../clients-data";

type SortDirection = NonNullable<DataTableSortProps["direction"]>;

interface Sorting {
  key: string;
  direction: SortDirection;
}

export interface UseAllocatorsColumnsOptions {
  sorting?: Sorting | null;
  onSort(key: string, direction: SortDirection): void;
}

const columnHelper =
  createColumnHelper<FetchClientsReturnType["data"][number]>();

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
    columnHelper.accessor("id", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "id")}
            onSort={(direction) => onSort("id", direction)}
          >
            Verified Client ID
          </DataTableSort>
        );
      },
      cell: ({ getValue, row }) => {
        const addressId = getValue();
        const githubLink = row.original.githubUrl;

        return (
          <div className="flex gap-1 items-center">
            <Link className="table-link" href={`clients/${addressId}`}>
              {addressId}
            </Link>
            {!!githubLink && (
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
    }),
    columnHelper.accessor("name", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "name")}
            onSort={(direction) => onSort("name", direction)}
          >
            Client Name
          </DataTableSort>
        );
      },
      cell({ getValue, row }) {
        const addressId = row.getValue("id") as string;
        const name = getValue() ?? addressId;

        if (name.length > 20) {
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
    }),
    columnHelper.accessor("datacapReceived", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "datacapReceived")}
            onSort={(direction) => onSort("datacapReceived", direction)}
          >
            DataCap Received
          </DataTableSort>
        );
      },
      cell: ({ getValue }) => {
        return (
          <div className="whitespace-nowrap flex gap-1 items-center">
            {filesize(getValue(), { standard: "iec" })}
          </div>
        );
      },
    }),
    columnHelper.accessor("datacapRemaining", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "datacapRemaining")}
            onSort={(direction) => onSort("datacapRemaining", direction)}
          >
            DataCap Remaining
          </DataTableSort>
        );
      },
      cell: ({ getValue }) => {
        return filesize(getValue(), { standard: "iec" });
      },
    }),
    columnHelper.accessor("datacapUsed2Weeks", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(
              sorting,
              "datacapUsed2Weeks"
            )}
            onSort={(direction) => onSort("datacapUsed2Weeks", direction)}
          >
            DC Used (2 weeks)
          </DataTableSort>
        );
      },
      cell: ({ getValue }) => {
        return filesize(getValue(), { standard: "iec" });
      },
    }),
    columnHelper.accessor("datacapUsed90Days", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(
              sorting,
              "datacapUsed90Days"
            )}
            onSort={(direction) => onSort("datacapUsed90Days", direction)}
          >
            DC Used (90 days)
          </DataTableSort>
        );
      },
      cell: ({ getValue }) => {
        return filesize(getValue(), { standard: "iec" });
      },
    }),
  ];
}
