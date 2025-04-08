"use client";
import { ICDPAllocatorFullReportStorageProviderDistribution } from "@/lib/interfaces/cdp/cdp.interface";
import { useReportsDetails } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { convertBytesToIEC } from "@/lib/utils";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { useMemo } from "react";

// const comparableValues = ['up', 'down']

const useReportViewProvidersColumns = (/*compareMode: boolean*/) => {
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
            {/*{compareMode && <CompareIcon compare={row.original.total_deal_size_compare}/>}*/}
          </div>
        );
      },
    },
    {
      accessorKey: "total_deal_percentage",
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

        const percentage = row.getValue("total_deal_percentage") as number;

        return (
          <div className="h-full flex items-center justify-start gap-1">
            {percentage.toFixed(2)}%
            {/*{compareMode && <CompareIcon compare={row.original.total_deal_percentage_compare}/>}*/}
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
            {/*{compareMode && <CompareIcon compare={row.original.duplicated_data_size_compare}/>}*/}
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
      accessorKey: "retrievability_success_rate",
      header: () => {
        return (
          <div className="whitespace-nowrap">Retrieval Rate (via HTTP)</div>
        );
      },
      cell: ({ row }) => {
        if (row.original.not_found) {
          return (
            <div className="h-full flex items-center justify-end gap-1">
              N/A
            </div>
          );
        }

        const successRate = row.getValue(
          "retrievability_success_rate"
        ) as number;

        return (
          <div className="h-full flex items-center justify-end gap-1">
            <span>{(successRate * 100).toFixed(2)}%</span>
            {/*{compareMode && <CompareIcon compare={row.original.retrievability_success_rate_compare}/>}*/}
          </div>
        );
      },
    },
  ] as ColumnDef<ICDPAllocatorFullReportStorageProviderDistribution>[];

  return { columns };
};

interface IReportViewProviderMapProps {
  providerDistribution: ICDPAllocatorFullReportStorageProviderDistribution[];
}

const ProviderTable = ({
  providerDistribution,
}: IReportViewProviderMapProps) => {
  const { compareMode } = useReportsDetails();

  const { columns } = useReportViewProvidersColumns();

  const rowSelection = useMemo(() => {
    const selection = {} as RowSelectionState;
    if (!compareMode) {
      return selection;
    }

    for (let i = 0; i < providerDistribution.length; i++) {
      // const item = providerDistribution[i];
      // selection[i] = comparableValues.includes(item.total_deal_size_compare ?? 'equal') || comparableValues.includes(item.total_deal_percentage_compare ?? 'equal') || comparableValues.includes(item.duplicated_data_size_compare ?? 'equal')
    }

    return selection;
  }, [providerDistribution, compareMode]);

  return (
    <div className="border-b border-t table-select-warning">
      <DataTable
        columns={columns}
        data={providerDistribution}
        rowSelection={rowSelection}
      />
    </div>
  );
};

export { ProviderTable };
