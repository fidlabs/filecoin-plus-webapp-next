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
import { type IClient } from "@/lib/interfaces/dmob/client.interface";
import { GithubIcon } from "@/components/icons/github.icon";
import { type IAllowanceArray } from "@/lib/interfaces/dmob/dmob.interface";

type FilterCallback = (key: string, direction: string) => void;

export const useClientsColumns = (filterCallback: FilterCallback) => {
  const columns = [
    {
      accessorKey: "addressId",
      header: () => {
        return (
          <DataTableSort property="addressId" setSorting={filterCallback}>
            Verified Client ID
          </DataTableSort>
        );
      },
      cell: ({ row }) => {
        const addressId = row.getValue("addressId") as string;
        const allowanceArraySorted = row.original.allowanceArray.sort(
          (a, b) => +b.height - +a.height
        );
        const allowanceArrayHead: IAllowanceArray | undefined =
          allowanceArraySorted[0];
        const githubLink = allowanceArrayHead?.auditTrail;

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
          <DataTableSort property="name" setSorting={filterCallback}>
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
            property="initialAllowance"
            setSorting={filterCallback}
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
            property="remainingDatacap"
            setSorting={filterCallback}
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
            property="usedDatacapChange"
            setSorting={filterCallback}
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
            property="usedDatacapChange90Days"
            setSorting={filterCallback}
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
