"use client";
import { useReportsDetails } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { GenericContentFooter } from "@/components/generic-content-view";
import { CompareIcon } from "@/components/icons/compare.icon";
import { DataTable } from "@/components/ui/data-table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { RandomPieceAvailabilityTooltip } from "@/components/ui/random-piece-availability-tooltip";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { IAllocatorReportProviderPaginationQuery } from "@/lib/interfaces/api.interface";
import { ICDPAllocatorFullReportStorageProviderDistribution } from "@/lib/interfaces/cdp/cdp.interface";
import { convertBytesToIEC } from "@/lib/utils";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import Link from "next/link";
import { useCallback, useMemo } from "react";

// const comparableValues = ['up', 'down']

const useReportViewProvidersColumns = (compareMode: boolean) => {
  const columns = [
    {
      accessorKey: "provider",
      header: () => {
        return <div className="whitespace-nowrap">Provider</div>;
      },
      cell: ({ row }) => {
        const provider = row.getValue("provider") as string;
        return (
          <Link className="table-link" href={`/storage-providers/${provider}`}>
            {provider}
          </Link>
        );
      },
    },
    {
      accessorKey: "location",
      header: () => {
        return <div className="whitespace-nowrap">Location</div>;
      },
      cell: ({ row }) => {
        if (row.original.not_found) {
          return (
            <div className="h-[40px] flex items-center justify-start gap-1">
              N/A
            </div>
          );
        }

        const rawLocation = row.original.location;
        if (!rawLocation) {
          return (
            <div className="h-full flex items-center justify-start gap-1">
              N/A
            </div>
          );
        }
        return (
          <div className="h-[40px] flex items-center justify-start gap-1">
            <HoverCard>
              <HoverCardTrigger>
                <div>
                  {rawLocation.city}, {rawLocation.region},{" "}
                  {rawLocation.country}
                </div>
              </HoverCardTrigger>
              <HoverCardContent>{rawLocation.org}</HoverCardContent>
            </HoverCard>
          </div>
        );
      },
    },
    {
      accessorKey: "total_deal_size",
      header: () => {
        return <div className="whitespace-nowrap">Total Deal Size</div>;
      },
      cell: ({ row }) => {
        if (row.original.not_found) {
          return (
            <div className="h-full flex items-center justify-start gap-1">
              N/A
            </div>
          );
        }
        const totalDealSize = row.getValue("total_deal_size") as number;
        return (
          <div className="h-full flex items-center justify-start gap-1">
            {convertBytesToIEC(totalDealSize)}
            {compareMode && (
              <CompareIcon compare={row.original.total_deal_size_compare} />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "perc_of_total_datacap",
      header: () => {
        return <div className="whitespace-nowrap">Percentage</div>;
      },
      cell: ({ row }) => {
        if (row.original.not_found) {
          return (
            <div className="h-full flex items-center justify-start gap-1">
              N/A
            </div>
          );
        }

        const percentage = row.getValue("perc_of_total_datacap") as number;

        return (
          <div className="h-full flex items-center justify-start gap-1">
            {percentage.toFixed(2)}%
            {compareMode && (
              <CompareIcon
                compare={row.original.perc_of_total_datacap_compare}
              />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "duplication_percentage",
      header: () => {
        return <div className="whitespace-nowrap">Duplication</div>;
      },
      cell: ({ row }) => {
        if (row.original.not_found) {
          return (
            <div className="h-full flex items-center justify-start gap-1">
              N/A
            </div>
          );
        }

        const duplication = row.getValue("duplication_percentage") as number;

        return (
          <div className="h-full flex items-center justify-start gap-1">
            {duplication.toFixed(2)}%
          </div>
        );
      },
    },
    {
      accessorKey: "claims_count",
      header: () => {
        return <div className="whitespace-nowrap">Total claims</div>;
      },
      cell: ({ row }) => {
        if (row.original.not_found) {
          return (
            <div className="h-full flex items-center justify-start gap-1">
              N/A
            </div>
          );
        }

        const claims_count = row.getValue("claims_count") as
          | boolean
          | undefined;
        return (
          <div className="h-full flex items-center justify-start gap-1">
            {claims_count ?? "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "retrievability_success_rate_http",
      header: () => {
        return <div className="whitespace-nowrap">HTTP Retrievability</div>;
      },
      cell: ({ row }) => {
        if (row.original.not_found) {
          return <span>N/A</span>;
        }

        const successRate = row.getValue(
          "retrievability_success_rate_http"
        ) as number;

        return <span>{(successRate * 100).toFixed(2)}%</span>;
      },
    },
    {
      accessorKey: "retrievability_success_rate_url_finder",
      header: () => <RandomPieceAvailabilityTooltip />,
      cell: ({ row }) => {
        if (row.original.not_found) {
          return <span className="text-right">N/A</span>;
        }
        const successRate = row.getValue(
          "retrievability_success_rate_url_finder"
        ) as number;

        return (
          <span className="text-right">{(successRate * 100).toFixed(2)}%</span>
        );
      },
    },
  ] as ColumnDef<ICDPAllocatorFullReportStorageProviderDistribution>[];

  return { columns };
};

interface IReportViewProviderMapProps {
  providerDistribution: ICDPAllocatorFullReportStorageProviderDistribution[];
  queryParams?: IAllocatorReportProviderPaginationQuery;
  totalPages?: number;
}

export function ProviderTable({
  providerDistribution,
  queryParams,
  totalPages,
}: IReportViewProviderMapProps) {
  const { compareMode } = useReportsDetails();
  const { filters, updateFilters } = useSearchParamsFilters();
  const { columns } = useReportViewProvidersColumns(compareMode);

  const rowSelection = useMemo<RowSelectionState>(() => {
    if (!compareMode) {
      return {};
    }

    return providerDistribution.reduce<RowSelectionState>(
      (result, item, index) => {
        const selected = [
          item.total_deal_size_compare,
          item.perc_of_total_datacap_compare,
        ].some((i) => i !== "equal");

        return {
          ...result,
          [String(index)]: selected,
        };
      },
      {}
    );
  }, [providerDistribution, compareMode]);

  const updateCustomProviderPagination = useCallback(
    (params: IAllocatorReportProviderPaginationQuery) => {
      updateFilters({
        providerPaginationPage: params.page ?? filters.providerPaginationPage,
        providerPaginationLimit:
          params.limit ?? filters.providerPaginationLimit,
      });
    },
    [updateFilters, filters]
  );

  return (
    <div className="border-b border-t table-select-warning">
      <DataTable
        columns={columns}
        data={providerDistribution}
        rowSelection={rowSelection}
      />
      <GenericContentFooter
        page={queryParams?.providerPaginationPage}
        limit={queryParams?.providerPaginationLimit}
        total={totalPages?.toString() ?? "0"}
        patchParams={updateCustomProviderPagination}
      />
    </div>
  );
}
