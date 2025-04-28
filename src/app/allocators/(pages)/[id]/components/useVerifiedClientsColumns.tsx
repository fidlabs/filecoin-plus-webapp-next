import { DMOBDataTableSort } from "@/components/dmob-data-table-sort";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { IClient } from "@/lib/interfaces/dmob/client.interface";
import { calculateDateFromHeight, convertBytesToIEC } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { InfoIcon } from "lucide-react";
import Link from "next/link";

type FilterCallback = (key: string, direction: string) => void;

export const useVerifiedClientsColumns = (filterCallback: FilterCallback) => {
  const columns = [
    {
      accessorKey: "addressId",
      header: () => {
        return (
          <DMOBDataTableSort property="addressId" onSort={filterCallback}>
            Verified Client ID
          </DMOBDataTableSort>
        );
      },
      cell: ({ row }) => {
        const addressId = row.getValue("addressId") as string;
        return (
          <Link className="table-link" href={`/clients/${addressId}`}>
            {addressId}
          </Link>
        );
      },
    },
    {
      accessorKey: "name",
      header: () => {
        return (
          <DMOBDataTableSort property="name" onSort={filterCallback}>
            Client name
          </DMOBDataTableSort>
        );
      },
      cell: ({ row }) => {
        const addressId = row.getValue("addressId") as string;
        const name = row.getValue("name") as string;
        if (name?.length > 20) {
          return (
            <HoverCard openDelay={100} closeDelay={50}>
              <HoverCardTrigger asChild>
                <Link className="table-link" href={`/clients/${addressId}`}>
                  {name.slice(0, 20)}...
                </Link>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">{name}</HoverCardContent>
            </HoverCard>
          );
        } else {
          return (
            <Link className="table-link" href={`/clients/${addressId}`}>
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
          <DMOBDataTableSort
            property="initialAllowance"
            onSort={filterCallback}
          >
            DataCap received
          </DMOBDataTableSort>
        );
      },
      cell: ({ row }) => {
        const initialAllowance = row.getValue("initialAllowance") as string;
        const allowanceArray = row.original.allowanceArray;
        return (
          <div className="whitespace-nowrap flex gap-1 items-center">
            {convertBytesToIEC(initialAllowance)}
            {allowanceArray?.length && (
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
          <DMOBDataTableSort
            property="remainingDatacap"
            onSort={filterCallback}
          >
            DataCap Remaining
          </DMOBDataTableSort>
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
          <DMOBDataTableSort
            property="usedDatacapChange"
            onSort={filterCallback}
          >
            DataCap Used Last 2 Weeks
          </DMOBDataTableSort>
        );
      },
      cell: ({ row }) => {
        const usedDatacapChange = row.getValue("usedDatacapChange") as string;
        return convertBytesToIEC(usedDatacapChange);
      },
    },
  ] as ColumnDef<IClient>[];

  const csvHeaders = [
    {
      key: "addressId",
      label: "Allocator ID",
    },
    {
      key: "name",
      label: "Name",
    },
    {
      key: "initialAllowance",
      label: "DataCap Received",
    },
    {
      key: "remainingDatacap",
      label: "DataCap Remaining",
    },
    {
      key: "usedDatacapChange",
      label: "DataCap Used Last 2 Weeks",
    },
  ];

  return { columns, csvHeaders };
};
