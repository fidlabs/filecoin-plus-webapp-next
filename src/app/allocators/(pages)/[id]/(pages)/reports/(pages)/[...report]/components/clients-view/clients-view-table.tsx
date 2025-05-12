"use client";

import { GithubIcon } from "@/components/icons/github.icon";
import { DataTable } from "@/components/ui/data-table";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import {
  ICDPAllocatorFullReportClient,
  ICDPAllocatorFullReportClientAllocation,
} from "@/lib/interfaces/cdp/cdp.interface";
import { convertBytesToIEC } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { differenceInDays, format } from "date-fns";
import { CheckIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";

interface UseClientsViewColumnsParameters {
  idsUsingContract: string[];
  idsReceivingDatacapFromMultipleAllocators: string[];
}

function getNumberOfDaysSinceLastAllocation(
  allocations: ICDPAllocatorFullReportClientAllocation[]
): number {
  const lastAllocationDate = allocations.toSorted((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);

    return dateB.valueOf() - dateA.valueOf();
  })[0].timestamp;

  return differenceInDays(Date.now(), lastAllocationDate);
}

function useClientsViewColumns({
  idsReceivingDatacapFromMultipleAllocators,
  idsUsingContract,
}: UseClientsViewColumnsParameters) {
  const columns = [
    {
      accessorKey: "client_id",
      header: () => {
        return <div className="whitespace-nowrap">ID</div>;
      },
      cell: ({ row }) => {
        const client_id = row.getValue("client_id") as string;
        const application_url = row.original.application_url as string;

        return (
          <div className="flex flex-row items-center justify-start gap-1">
            {idsUsingContract.includes(client_id) && (
              <CheckIcon className="h-4 w-4 text-green-500" />
            )}
            {idsReceivingDatacapFromMultipleAllocators.includes(client_id) && (
              <TriangleAlertIcon className="h-4 w-4 text-yellow-600" />
            )}
            <Link className="table-link" href={`/clients/${client_id}`}>
              {client_id}
            </Link>
            {application_url && (
              <Link
                className="text-gray-500 hover:text-gray-900"
                target="_blank"
                href={application_url}
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
        return <div className="whitespace-nowrap">Name</div>;
      },
      cell: ({ row }) => {
        const client_id = row.getValue("client_id");
        const name = row.getValue("name") as string;
        return (
          <Link className="table-link" href={`/clients/${client_id}`}>
            {name}
          </Link>
        );
      },
    },
    {
      accessorKey: "total_allocations",
      header: () => {
        return <div className="whitespace-nowrap">Total Allocations</div>;
      },
      cell: ({ row }) => {
        const totalAllocations = row.getValue("total_allocations") as string;
        const allocationsNumber = row.original.allocations_number;

        return (
          <>
            <div className="whitespace-nowrap">
              <strong>{convertBytesToIEC(totalAllocations)}</strong> in{" "}
              <strong>{allocationsNumber}</strong> allocation
              {allocationsNumber === 1 ? "" : "s"}
            </div>

            <ResponsiveDialog>
              <ResponsiveDialogTrigger asChild>
                <span className="text-xs underline cursor-pointer">
                  See Breakdown
                </span>
              </ResponsiveDialogTrigger>
              <ResponsiveDialogContent>
                <div className="p-4">
                  <Table>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>DataCap</TableHead>
                    </TableRow>
                    {row.original.allocations.map((allocation, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            {format(allocation.timestamp, "dd/MM/yyyy HH:mm")}
                          </TableCell>
                          <TableCell>
                            {convertBytesToIEC(allocation.allocation)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </Table>
                </div>
              </ResponsiveDialogContent>
            </ResponsiveDialog>
          </>
        );
      },
    },

    {
      accessorKey: "time_since_allocation",
      header: () => {
        return <div>Time Since Last Allocation</div>;
      },
      cell: ({ row }) => {
        const daysSinceLastAllocation = getNumberOfDaysSinceLastAllocation(
          row.original.allocations
        );

        return (
          <span>
            {getNumberOfDaysSinceLastAllocation(row.original.allocations)} day
            {daysSinceLastAllocation !== 1 && "s"}
          </span>
        );
      },
    },
    {
      accessorKey: "spending_speed",
      header: () => {
        return <div>Spending Speed</div>;
      },
      cell: ({ row }) => {
        const totalAllocations = BigInt(row.getValue("total_allocations"));
        const daysSinceLastAllocation = BigInt(
          getNumberOfDaysSinceLastAllocation(row.original.allocations)
        );
        const spendingSpeed = (
          totalAllocations / daysSinceLastAllocation
        ).toString();

        return <span>{convertBytesToIEC(spendingSpeed)} / day</span>;
      },
    },
    {
      accessorKey: "application_timestamp",
      header: () => {
        return <div className="whitespace-nowrap">Date of Application</div>;
      },
      cell: ({ row }) => {
        const application_timestamp = row.getValue(
          "application_timestamp"
        ) as string;
        return <span>{format(application_timestamp, "dd/MM/yyyy HH:mm")}</span>;
      },
    },
    {
      accessorKey: "latest_report",
      header() {
        return <div className="whitespace-nowrap">Latest Report</div>;
      },
      cell({ row }) {
        return (
          <Link
            className="underline text-dodger-blue"
            href={`/client-report/${row.getValue("client_id")}/latest`}
          >
            View Report
          </Link>
        );
      },
    },
  ] as ColumnDef<ICDPAllocatorFullReportClient>[];

  return { columns };
}

export interface ClientsViewTableProps
  extends Partial<UseClientsViewColumnsParameters> {
  clients: ICDPAllocatorFullReportClient[];
}

export function ClientsViewTable({
  clients,
  idsReceivingDatacapFromMultipleAllocators = [],
  idsUsingContract = [],
}: ClientsViewTableProps) {
  const { columns } = useClientsViewColumns({
    idsReceivingDatacapFromMultipleAllocators,
    idsUsingContract,
  });

  return (
    <div className="border-b border-t table-select-warning">
      <DataTable columns={columns} data={clients} />
    </div>
  );
}
