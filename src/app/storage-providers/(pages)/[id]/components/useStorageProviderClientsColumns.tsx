import { FetchStorageProviderClientsListReturnType } from "@/app/storage-providers/storage-providers-data";
import {
  DataTableSort,
  type DataTableSortProps,
} from "@/components/data-table-sort";
import { createColumnHelper } from "@tanstack/react-table";
import { filesize } from "filesize";
import Link from "next/link";

type SortDirection = NonNullable<DataTableSortProps["direction"]>;

interface Sorting {
  key: string;
  direction: SortDirection;
}

export interface UseStorageProviderClientsColumnsOptions {
  sorting?: Sorting | null;
  onSort(key: string, direction: SortDirection): void;
}

const columnHelper =
  createColumnHelper<
    FetchStorageProviderClientsListReturnType["data"][number]
  >();

const dateFormatter = Intl.DateTimeFormat("en-US", {
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

export const useStorageProviderClientsColumns = ({
  sorting,
  onSort,
}: UseStorageProviderClientsColumnsOptions) => {
  const columns = [
    columnHelper.accessor("clientId", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "clientId")}
            onSort={(direction) => onSort("clientId", direction)}
          >
            Client ID
          </DataTableSort>
        );
      },
      cell: ({ getValue }) => {
        const clientId = getValue();

        return (
          <Link className="table-link" href={`/clients/${clientId}`}>
            {clientId}
          </Link>
        );
      },
    }),
    columnHelper.accessor("clientName", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "clientName")}
            onSort={(direction) => onSort("clientName", direction)}
          >
            Client Name
          </DataTableSort>
        );
      },
      cell: ({ getValue, row }) => {
        const clientId = row.original.clientId;
        const clientName = getValue();

        return (
          <Link className="table-link" href={`/clients/${clientId}`}>
            {clientName}
          </Link>
        );
      },
    }),
    columnHelper.accessor("dealsCount", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "dealsCount")}
            onSort={(direction) => onSort("dealsCount", direction)}
          >
            Deals Count
          </DataTableSort>
        );
      },
    }),
    columnHelper.accessor("totalDealsSize", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "totalDealsSize")}
            onSort={(direction) => onSort("totalDealsSize", direction)}
          >
            Total Deals Size
          </DataTableSort>
        );
      },
      cell({ getValue }) {
        return filesize(getValue(), { standard: "iec" });
      },
    }),
    columnHelper.accessor("lastDealDate", {
      header() {
        return (
          <DataTableSort
            direction={getSortDirectionForProperty(sorting, "lastDealDate")}
            onSort={(direction) => onSort("lastDealDate", direction)}
          >
            Total Deals Size
          </DataTableSort>
        );
      },
      cell({ getValue }) {
        const dateString = getValue();

        if (!dateString) {
          return "N/A";
        }

        return dateFormatter.format(new Date(dateString));
      },
    }),
  ];

  const csvHeaders = [
    {
      label: "Client ID",
      key: "clientId",
    },
    {
      label: "Client Name",
      key: "Client Name",
    },
    {
      label: "Deals Count",
      key: "dealsCount",
    },
    {
      label: "Total Deals Size",
      key: "totalDealsSize",
    },
    {
      label: "Last Deal Date",
      key: "lastDealDate",
    },
  ];

  return { columns, csvHeaders } as const;
};
