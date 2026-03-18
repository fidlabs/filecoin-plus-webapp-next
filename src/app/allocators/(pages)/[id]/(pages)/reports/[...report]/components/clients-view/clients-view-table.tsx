"use client";

import { GithubIcon } from "@/components/icons/github.icon";
import { OverlayLoader } from "@/components/overlay-loader";
import { StringShortener } from "@/components/string-shortener";
import { CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Paginator } from "@/components/ui/pagination";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import {
  getAllocatorReportById,
  type GetAllocatorReportByIdParameters,
} from "@/lib/api";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import {
  AllocatorReportCheckType,
  type AllocatorFullReportFoundClient,
  type ICDPAllocatorFullReportClientAllocation,
} from "@/lib/interfaces/cdp/cdp.interface";
import { cn, convertBytesToIEC } from "@/lib/utils";
import { createColumnHelper } from "@tanstack/react-table";
import { differenceInDays, format } from "date-fns";
import { filesize } from "filesize";
import { CheckIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef } from "react";
import useSWR from "swr";

export interface ClientsViewTableProps {
  allocatorId: string;
  reportId: string;
}

const columnHelper = createColumnHelper<AllocatorFullReportFoundClient>();

function getNumberOfDaysSinceAllocation(
  allocations: ICDPAllocatorFullReportClientAllocation[],
  mode: "first" | "last"
): number | null {
  const allocationDate: string | undefined = allocations.toSorted((a, b) => {
    const dateAValue = new Date(a.timestamp).valueOf();
    const dateBValue = new Date(b.timestamp).valueOf();

    return mode === "last" ? dateBValue - dateAValue : dateAValue - dateBValue;
  })[0]?.timestamp;

  if (!allocationDate) {
    return null;
  }

  return differenceInDays(Date.now(), allocationDate);
}

export function ClientsViewTable({
  allocatorId,
  reportId,
}: ClientsViewTableProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [page, setPage] = useQueryState(
    "clientPaginationPage",
    parseAsInteger.withDefault(1)
  );
  const [pageSize, setPageSize] = useQueryState(
    "clientPaginationLimit",
    parseAsInteger.withDefault(10)
  );

  const parameters: GetAllocatorReportByIdParameters = {
    allocatorId,
    reportId,
    clientPaginationPage: page,
    clientPaginationLimit: pageSize,
    providerPaginationPage: 1,
    providerPaginationLimit: 10,
  };

  const { data, error, isLoading, mutate } = useSWR(
    [QueryKey.ALLOCATOR_REPORT_BY_ID, parameters],
    ([, fetchParameters]) => {
      return getAllocatorReportById(fetchParameters);
    },
    {
      keepPreviousData: true,
      revalidateOnMount: false,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  useEffect(() => {
    if (!data && !error && !isLoading) {
      mutate();
    }
  }, [data, error, isLoading, mutate]);

  useEffect(() => {
    const containerElement = containerRef.current;

    if (containerElement) {
      requestAnimationFrame(() => {
        containerElement.scrollIntoView({ block: "start" });
      });
    }
  }, [page, pageSize]);

  const clients = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.clients.data.filter((client) => !client.not_found);
  }, [data]);

  const columns = useMemo(() => {
    const idsUsingContract = data
      ? data.clients.data
          .filter((client) => !client.not_found && client.using_client_contract)
          .map((client) => client.client_id)
      : [];

    const idsReceivingDatacapFromMultipleAllocators = data
      ? (data.check_results.find((result) => {
          return (
            result.check === AllocatorReportCheckType.CLIENT_MULTIPLE_ALLOCATORS
          );
        })?.metadata.violating_ids ?? [])
      : [];

    const idsWithNotEnoughReplicas = data
      ? (data.check_results.find((result) => {
          return (
            result.check === AllocatorReportCheckType.CLIENT_NOT_ENOUGH_COPIES
          );
        })?.metadata.violating_ids ?? [])
      : [];

    return [
      columnHelper.accessor("client_id", {
        header: "ID",
        cell: ({ getValue, row }) => {
          const clientId = getValue();
          const applicationUrl = row.original.application_url;

          return (
            <div className="flex flex-row items-center justify-start gap-1">
              {idsUsingContract.includes(clientId) && (
                <CheckIcon className="h-4 w-4 text-green-500" />
              )}
              {idsReceivingDatacapFromMultipleAllocators.includes(clientId) && (
                <TriangleAlertIcon className="h-4 w-4 text-yellow-600" />
              )}
              <Link className="table-link" href={`/clients/${clientId}`}>
                {clientId}
              </Link>
              {applicationUrl && (
                <Link
                  className="text-gray-500 hover:text-gray-900"
                  target="_blank"
                  href={applicationUrl}
                >
                  <GithubIcon width={15} height={15} />
                </Link>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: ({ getValue, row }) => {
          const clientId = row.original.client_id;
          const name = getValue();
          return (
            <Link className="table-link" href={`/clients/${clientId}`}>
              <StringShortener
                value={typeof name === "string" ? name : "N/A"}
                maxLength={30}
              />
            </Link>
          );
        },
      }),
      columnHelper.accessor("total_allocations", {
        header: () => {
          return <span className="whitespace-nowrap">Total Allocations</span>;
        },
        cell: ({ getValue, row }) => {
          const totalAllocations = getValue();
          const allocationsNumber = row.original.allocations_number;

          return (
            <>
              <div className="whitespace-nowrap">
                <strong>
                  {filesize(totalAllocations, { standard: "iec" })}
                </strong>{" "}
                in <strong>{allocationsNumber}</strong> allocation
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
      }),
      columnHelper.display({
        id: "time_since_allocation",
        header: "Time Since Last Allocation",
        cell: ({ row }) => {
          const daysSinceLastAllocation = getNumberOfDaysSinceAllocation(
            row.original.allocations,
            "last"
          );

          if (daysSinceLastAllocation === null) {
            return "N/A";
          }

          return (
            <span>
              {daysSinceLastAllocation} day
              {daysSinceLastAllocation !== 1 && "s"}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "spending_speed",
        header: "Spending Speed",
        cell: ({ row }) => {
          const daysSinceLastAllocation = getNumberOfDaysSinceAllocation(
            row.original.allocations,
            "first"
          );

          if (daysSinceLastAllocation === null) {
            return "N/A";
          }

          const totalAllocations = BigInt(row.getValue("total_allocations"));

          const spendingSpeed =
            daysSinceLastAllocation > 0
              ? (totalAllocations / BigInt(daysSinceLastAllocation)).toString()
              : totalAllocations.toString();

          return (
            <span>{filesize(spendingSpeed, { standard: "iec" })} / day</span>
          );
        },
      }),
      columnHelper.accessor("application_timestamp", {
        header: () => {
          return <span className="whitespace-nowrap">Date of Application</span>;
        },
        cell: ({ getValue }) => {
          const applicationTimestamp = getValue();
          return (
            <span>{format(applicationTimestamp, "dd/MM/yyyy HH:mm")}</span>
          );
        },
      }),
      columnHelper.accessor(
        (row) => idsWithNotEnoughReplicas.includes(row.client_id),
        {
          id: "enough_replicas",
          header() {
            return (
              <span className="whitespace-nowrap">Has Enough Replicas</span>
            );
          },
          cell({ getValue }) {
            const value = getValue();
            return (
              <span
                className={cn({
                  "text-red-500": !value,
                })}
              >
                {value ? "Yes" : "No"}
              </span>
            );
          },
        }
      ),
      columnHelper.display({
        id: "latest_report",
        header() {
          return <div className="whitespace-nowrap">Latest Report</div>;
        },
        cell({ row }) {
          return (
            <Link
              className="underline text-dodger-blue"
              href={`/client-report/${row.original.client_id}/latest`}
            >
              View Report
            </Link>
          );
        },
      }),
    ];
  }, [data]);

  const setContainerRef = useCallback((element: HTMLElement | null) => {
    containerRef.current = element;
  }, []);

  return (
    <div
      className="border-b border-t table-select-warning"
      ref={setContainerRef}
    >
      {!!error && !isLoading && (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            An error occurred, please try again later.
          </p>
        </div>
      )}

      {!!data && !error && (
        <div className="relative">
          <DataTable columns={columns} data={clients} />
          <OverlayLoader show={isLongLoading} />
        </div>
      )}

      <CardFooter className="border-t w-full p-3">
        <Paginator
          page={page}
          pageSize={pageSize}
          pageSizeOptions={[10, 15, 25]}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          total={data?.clients.pagination?.total ?? 0}
        />
      </CardFooter>
    </div>
  );
}
