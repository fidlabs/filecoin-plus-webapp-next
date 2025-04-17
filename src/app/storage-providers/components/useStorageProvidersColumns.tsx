import { DataTableSort } from "@/components/ui/data-table";
import Link from "next/link";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { calculateDateFromHeight, convertBytesToIEC } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { IStorageProvider } from "@/lib/interfaces/dmob/sp.interface";

type FilterCallback = (key: string, direction: string) => void;

export const useStorageProvidersColumns = (filterCallback: FilterCallback) => {
  const columns = [
    {
      accessorKey: "provider",
      header: () => {
        return (
          <DataTableSort property="provider" setSorting={filterCallback}>
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
            property="noOfVerifiedDeals"
            setSorting={filterCallback}
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
          <DataTableSort property="noOfClients" setSorting={filterCallback}>
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
        ) as number;
        return convertBytesToIEC(+verifiedDealsTotalSize);
      },
    },
    {
      accessorKey: "lastDealHeight",
      header: () => {
        return (
          <DataTableSort property="lastDealHeight" setSorting={filterCallback}>
            Last Deal
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const lastDealHeight = row.getValue("lastDealHeight") as number;
        return (
          <div className="whitespace-nowrap flex gap-1 items-center">
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

  const csvHeaders = [
    {
      key: "addressId",
      label: "Allocator ID",
    },
    {
      key: "noOfVerifiedDeals",
      label: "Deals",
    },
    {
      key: "noOfClients",
      label: "Number of clients",
    },
    {
      key: "verifiedDealsTotalSize",
      label: "Total Deals Size",
    },
    {
      key: "lastDealHeight",
      label: "Last Deal",
    },
  ];

  return { columns, csvHeaders };
};
