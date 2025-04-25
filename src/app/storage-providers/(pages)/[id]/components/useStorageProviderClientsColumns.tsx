import { DMOBDataTableSort } from "@/components/dmob-data-table-sort";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { IStorageProviderClient } from "@/lib/interfaces/dmob/sp.interface";
import { calculateDateFromHeight, convertBytesToIEC } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { InfoIcon } from "lucide-react";
import Link from "next/link";

type FilterCallback = (key: string, direction: string) => void;

export const useStorageProviderClientsColumns = (
  filterCallback: FilterCallback
) => {
  const columns = [
    {
      accessorKey: "client",
      header: () => {
        return (
          <DMOBDataTableSort property="client" onSort={filterCallback}>
            Verified Client ID
          </DMOBDataTableSort>
        );
      },
      cell: ({ row }) => {
        const client = row.getValue("client") as string;
        return (
          <Link className="table-link" href={`/clients/${client}`}>
            {client}
          </Link>
        );
      },
    },
    {
      accessorKey: "noOfVerifiedDeals",
      header: () => {
        return (
          <DMOBDataTableSort
            property="noOfVerifiedDeals"
            onSort={filterCallback}
          >
            Deals
          </DMOBDataTableSort>
        );
      },
      cell: ({ row }) => {
        const noOfVerifiedDeals = row.getValue("noOfVerifiedDeals") as string;
        return <p>{noOfVerifiedDeals}</p>;
      },
    },
    {
      accessorKey: "verifiedDealsTotalSize",
      header: () => {
        return (
          <DMOBDataTableSort
            property="verifiedDealsTotalSize"
            onSort={filterCallback}
          >
            Verified Deals Total Size
          </DMOBDataTableSort>
        );
      },
      cell: ({ row }) => {
        const verifiedDealsTotalSize = row.getValue(
          "verifiedDealsTotalSize"
        ) as string;
        return <p>{convertBytesToIEC(verifiedDealsTotalSize)}</p>;
      },
    },
    {
      accessorKey: "lastDealHeight",
      header: () => {
        return (
          <DMOBDataTableSort property="lastDealHeight" onSort={filterCallback}>
            Last Deal Date
          </DMOBDataTableSort>
        );
      },
      cell: ({ row }) => {
        const lastDealHeight = row.getValue("lastDealHeight") as string;
        return (
          <div className="whitespace-nowrap flex gap-1 items-center">
            {calculateDateFromHeight(+lastDealHeight)}
            <HoverCard openDelay={100} closeDelay={50}>
              <HoverCardTrigger>
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
  ] as ColumnDef<IStorageProviderClient>[];

  const csvHeaders = [
    {
      label: "Verified Client ID",
      key: "concat",
    },
    {
      label: "Deals",
      key: "noOfVerifiedDeals",
    },
    {
      label: "Verified Deals Total Size",
      key: "verifiedDealsTotalSize",
    },
    {
      label: "Last Deal Date",
      key: "lastDealHeight",
    },
  ];

  return { columns, csvHeaders };
};
