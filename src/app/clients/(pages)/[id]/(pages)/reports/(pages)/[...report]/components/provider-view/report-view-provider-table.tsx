"use client";
import { useReportsDetails } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { CompareIcon } from "@/components/icons/compare.icon";
import { DataTable } from "@/components/ui/data-table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { RandomPieceAvailabilityTooltip } from "@/components/ui/random-piece-availability-tooltip";
import {
  IClientReportStorageProviderDistribution,
  IPNIReportingStatus,
} from "@/lib/interfaces/cdp/cdp.interface";
import { convertBytesToIEC } from "@/lib/utils";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const comparableValues = ["up", "down"];

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
            {compareMode && (
              <CompareIcon
                compare={row.original.total_deal_percentage_compare}
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
        const duplicatedDataSize = row.original.duplicated_data_size;

        return (
          <div className="h-full flex items-center justify-start gap-1">
            {duplication.toFixed(2)}%
            {!!duplicatedDataSize && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <InfoIcon
                    size={15}
                    className="text-muted-foreground cursor-help"
                  />
                </HoverCardTrigger>
                <HoverCardContent>
                  <div>
                    <div className="text-sm">
                      Duplicated Data Size:{" "}
                      {convertBytesToIEC(duplicatedDataSize)}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
            {compareMode && (
              <CompareIcon
                compare={row.original.duplicated_data_size_compare}
              />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "ipni_reporting_status",
      header: () => {
        return <div className="whitespace-nowrap">IPNI Misreporting</div>;
      },
      cell: ({ row }) => {
        if (row.original.not_found) {
          return (
            <div className="h-full flex items-center justify-start gap-1">
              N/A
            </div>
          );
        }

        const ipni_reporting_status = row.getValue(
          "ipni_reporting_status"
        ) as IPNIReportingStatus;
        const ipni_reported_claims_count = row.original
          .ipni_reported_claims_count as string | undefined;

        switch (ipni_reporting_status) {
          case "MISREPORTING":
            return (
              <div className="h-full flex items-center justify-start gap-1">
                <span>Yes</span>
                {ipni_reported_claims_count && (
                  <span>({ipni_reported_claims_count} claims)</span>
                )}
              </div>
            );
          case "NOT_REPORTING":
            return (
              <div className="h-full flex items-center justify-start gap-1">
                Not reporting
              </div>
            );
          case "OK":
            return (
              <div className="h-full flex items-center justify-start gap-1">
                OK
              </div>
            );
        }
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
        return <div className="whitespace-nowrap">Retrieval Rate</div>;
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
            {compareMode && (
              <CompareIcon
                compare={row.original.retrievability_success_rate_compare}
              />
            )}
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
          return (
            <div className="h-full flex items-center justify-end gap-1">
              N/A
            </div>
          );
        }

        const successRate = row.getValue(
          "retrievability_success_rate_http"
        ) as number;

        return (
          <div className="h-full flex items-center justify-end gap-1">
            <span>{(successRate * 100).toFixed(2)}%</span>
            {compareMode && (
              <CompareIcon
                compare={row.original.retrievability_success_rate_http_compare}
              />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "retrievability_success_rate_url_finder",
      header: () => <RandomPieceAvailabilityTooltip />,
      cell: ({ row }) => {
        if (row.original.not_found) {
          return (
            <div className="h-full flex items-center justify-end gap-1">
              N/A
            </div>
          );
        }

        const successRate = row.getValue(
          "retrievability_success_rate_url_finder"
        ) as number;

        return (
          <div className="h-full flex items-center justify-end gap-1">
            <span>{(successRate * 100).toFixed(2)}%</span>
            {compareMode && (
              <CompareIcon
                compare={
                  row.original.retrievability_success_rate_url_finder_compare
                }
              />
            )}
          </div>
        );
      },
    },
  ] as ColumnDef<IClientReportStorageProviderDistribution>[];

  return { columns };
};

interface IReportViewProviderMapProps {
  providerDistribution: IClientReportStorageProviderDistribution[];
}

const ReportViewProviderTable = ({
  providerDistribution,
}: IReportViewProviderMapProps) => {
  const { compareMode } = useReportsDetails();

  //{ 0: true, 1: true, 2: true }

  const { columns } = useReportViewProvidersColumns(compareMode);

  const rowSelection = useMemo(() => {
    const selection = {} as RowSelectionState;
    if (!compareMode) {
      return selection;
    }

    for (let i = 0; i < providerDistribution.length; i++) {
      const item = providerDistribution[i];
      selection[i] =
        comparableValues.includes(item.total_deal_size_compare ?? "equal") ||
        comparableValues.includes(
          item.total_deal_percentage_compare ?? "equal"
        ) ||
        comparableValues.includes(item.duplicated_data_size_compare ?? "equal");
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

export { ReportViewProviderTable };
