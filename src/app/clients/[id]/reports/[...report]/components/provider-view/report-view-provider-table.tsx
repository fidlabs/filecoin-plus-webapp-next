"use client";

import { CopyButton } from "@/components/copy-button";
import { CompareIcon } from "@/components/icons/compare.icon";
import { DataTable } from "@/components/ui/data-table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { RandomPieceAvailabilityTooltip } from "@/components/ui/random-piece-availability-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type ComparedValue,
  type IClientFullReport,
} from "@/lib/interfaces/cdp/cdp.interface";
import { ArrayElement, bigintToPercentage } from "@/lib/utils";
import { createColumnHelper, RowSelectionState } from "@tanstack/react-table";
import { filesize } from "filesize";
import { FileWarning, InfoIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export interface ReportViewProviderTable {
  report: IClientFullReport;
  reportToCompare?: IClientFullReport;
}

type RawItem = ArrayElement<IClientFullReport["storage_provider_distribution"]>;
type EnrichedItem = RawItem & {
  duplicatedDataSize: bigint;
  duplicationPercentage: number;
  totalDealPercentage: number;
};

type ComparableField = ArrayElement<typeof comparableFields>;
type ComparedItem = Omit<EnrichedItem, ComparableField> & {
  [K in ComparableField]: ComparedValue<EnrichedItem[K]>;
};

const httpRetrievabilityColumnId = "http_retrievability";
const comparableFields = [
  "total_deal_size",
  "totalDealPercentage",
  "duplicationPercentage",
  "claims_count",
  "retrievability_success_rate_http",
  "retrievability_success_rate_url_finder",
] as const satisfies Array<keyof EnrichedItem>;

const columnHelper = createColumnHelper<ComparedItem>();
const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

const columns = [
  columnHelper.accessor("provider", {
    header: "Provider",
    cell({ getValue }) {
      const provider = getValue();
      return (
        <Link className="table-link" href={`/storage-providers/${provider}`}>
          {provider}
        </Link>
      );
    },
  }),
  columnHelper.accessor("location", {
    header: "Location",
    cell({ row, getValue }) {
      const location = getValue();

      if (row.original.not_found || !location) {
        return "N/A";
      }

      return (
        <HoverCard>
          <HoverCardTrigger>
            <span className="whitespace-nowrap">
              {location.city}, {location.region}, {location.country}
            </span>
          </HoverCardTrigger>
          <HoverCardContent>{location.org}</HoverCardContent>
        </HoverCard>
      );
    },
  }),
  columnHelper.accessor("total_deal_size", {
    id: "total_deal_size",
    header() {
      return <span className="whitespace-nowrap">Total Deal Size</span>;
    },
    cell({ getValue, row }) {
      if (row.original.not_found) {
        return "N/A";
      }

      const totalDealSize = getValue();

      return (
        <div className="h-full flex items-center justify-start gap-1">
          {filesize(totalDealSize.value, { standard: "iec" })}
          <CompareIcon compare={totalDealSize.result} />
        </div>
      );
    },
  }),
  columnHelper.accessor("totalDealPercentage", {
    header: "Percentage",
    cell({ getValue, row }) {
      if (row.original.not_found) {
        return "N/A";
      }

      const percentage = getValue();

      return (
        <div className="h-full flex items-center justify-start gap-1">
          {percentageFormatter.format(percentage.value / 100)}
          <CompareIcon compare={percentage.result} />
        </div>
      );
    },
  }),
  columnHelper.accessor("duplicationPercentage", {
    header: "Duplication",
    cell({ getValue, row }) {
      if (row.original.not_found) {
        return "N/A";
      }

      const duplication = getValue();

      return (
        <div className="h-full flex items-center justify-start gap-1">
          {percentageFormatter.format(duplication.value)}
          <HoverCard>
            <HoverCardTrigger asChild>
              <InfoIcon
                size={15}
                className="text-muted-foreground cursor-help"
              />
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="text-sm">
                Duplicated Data Size:{" "}
                {filesize(row.original.duplicatedDataSize, {
                  standard: "iec",
                })}
              </div>
            </HoverCardContent>
          </HoverCard>
          <CompareIcon compare={duplication.result} />
        </div>
      );
    },
  }),
  columnHelper.accessor("claims_count", {
    id: "claims_count",
    header: () => {
      return <div className="whitespace-nowrap">Total claims</div>;
    },
    cell: ({ getValue, row }) => {
      const claimsCount = getValue();

      if (row.original.not_found || !claimsCount.value) {
        return "N/A";
      }

      return (
        <div className="h-full flex items-center justify-start gap-1">
          {claimsCount.value}
          <CompareIcon compare={claimsCount.result} />
        </div>
      );
    },
  }),
  columnHelper.accessor("retrievability_success_rate_http", {
    id: httpRetrievabilityColumnId,
    header() {
      return <span className="whitespace-nowrap">HTTP Retrievability</span>;
    },
    cell({ getValue, row }) {
      const successRate = getValue();

      if (row.original.not_found || typeof successRate.value !== "number") {
        return "N/A";
      }

      return (
        <div className="h-full flex items-center justify-start gap-1">
          {percentageFormatter.format(successRate.value)}
          <CompareIcon compare={successRate.result} />
        </div>
      );
    },
  }),
  columnHelper.accessor("retrievability_success_rate_url_finder", {
    header() {
      return <RandomPieceAvailabilityTooltip />;
    },
    cell: ({ getValue, row }) => {
      const successRate = getValue();

      if (row.original.not_found || typeof successRate.value !== "number") {
        return <span className="text-right">N/A</span>;
      }

      return (
        <div className="h-full flex items-center justify-start gap-1">
          {percentageFormatter.format(successRate.value)}
          <CompareIcon compare={successRate.result} />
        </div>
      );
    },
  }),
  columnHelper.accessor("piece_working_url", {
    header() {
      return <span className="whitespace-nowrap">Piece URL</span>;
    },
    cell: ({ getValue }) => {
      const pieceWorkingUrl = getValue();

      return (
        <div className="h-full flex items-center justify-center">
          {!pieceWorkingUrl ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <FileWarning size={15} />
                </TooltipTrigger>
                <TooltipContent>Sample piece URL not found</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <CopyButton
              tooltipText="Copy sample piece URL"
              copyText={pieceWorkingUrl}
              successText="Copied piece URL to clipboard"
            />
          )}
        </div>
      );
    },
  }),
];

function enrichRawItem(rawItem: RawItem, allDealsSize: bigint): EnrichedItem {
  const uniqueDataSize = BigInt(rawItem.unique_data_size);
  const totalDealSize = BigInt(rawItem.total_deal_size);
  const duplicatedDataSize = totalDealSize - uniqueDataSize;

  return {
    ...rawItem,
    duplicatedDataSize,
    duplicationPercentage:
      bigintToPercentage(duplicatedDataSize, totalDealSize, 6) / 100,
    totalDealPercentage:
      bigintToPercentage(totalDealSize, allDealsSize, 6) / 100,
  };
}

function compareValues<T>(
  givenValue: T,
  comparedValue: unknown
): ComparedValue<T> {
  if (typeof givenValue === "string" && typeof comparedValue === "string") {
    try {
      const givenValueBigInt = BigInt(givenValue);
      const comparedValueBigInt = BigInt(comparedValue);

      return {
        value: givenValue,
        result:
          givenValueBigInt === comparedValueBigInt
            ? "equal"
            : givenValueBigInt > comparedValueBigInt
              ? "up"
              : "down",
      };
    } catch (error) {
      return {
        value: givenValue,
        result: undefined,
      };
    }
  }

  if (typeof givenValue === "number" && typeof comparedValue === "number") {
    return {
      value: givenValue,
      result:
        givenValue === comparedValue
          ? "equal"
          : givenValue > comparedValue
            ? "up"
            : "down",
    };
  }

  return {
    value: givenValue,
    result: undefined,
  };
}

function compareEnrichedItems(
  givenItem: EnrichedItem,
  comparedItem?: EnrichedItem
): ComparedItem {
  const comparedEntries = comparableFields.map((field) => {
    return [field, compareValues(givenItem[field], comparedItem?.[field])];
  });

  return {
    ...givenItem,
    ...Object.fromEntries(comparedEntries),
  };
}

export function ReportViewProviderTable({
  report,
  reportToCompare,
}: ReportViewProviderTable) {
  const items = useMemo(() => {
    const allDealsSize = report.storage_provider_distribution.reduce(
      (sum, item) => {
        return sum + BigInt(item.total_deal_size);
      },
      0n
    );
    const comparedAllDealsSize =
      reportToCompare?.storage_provider_distribution.reduce((sum, item) => {
        return sum + BigInt(item.total_deal_size);
      }, 0n) ?? 0n;
    const enrichedItems = report.storage_provider_distribution.map((item) =>
      enrichRawItem(item, allDealsSize)
    );
    const comparedEnrichedItems = reportToCompare
      ? reportToCompare.storage_provider_distribution.map((item) =>
          enrichRawItem(item, comparedAllDealsSize)
        )
      : [];

    return enrichedItems.map((item) => {
      const comparedItem = comparedEnrichedItems.find(
        (candidate) => item.provider === candidate.provider
      );
      return compareEnrichedItems(item, comparedItem);
    });
  }, [report, reportToCompare]);

  const hideSparkRetrievability = useMemo(() => {
    return items.every((item) => {
      return typeof item.retrievability_success_rate_http !== "number";
    });
  }, [items]);

  const rowSelection = useMemo<RowSelectionState>(() => {
    return items.reduce<RowSelectionState>((result, item, index) => {
      const selected = comparableFields.some((field) => {
        const result = item[field].result;
        return result === "up" || result === "down";
      });

      return {
        ...result,
        [String(index)]: selected,
      };
    }, {});
  }, [items]);

  return (
    <div className="border-b border-t table-select-warning">
      <DataTable
        columns={columns}
        data={items}
        rowSelection={rowSelection}
        columnVisibility={{
          [httpRetrievabilityColumnId]: !hideSparkRetrievability,
        }}
      />
    </div>
  );
}
