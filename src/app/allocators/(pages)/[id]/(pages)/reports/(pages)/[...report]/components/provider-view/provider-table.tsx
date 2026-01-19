"use client";

import { CompareIcon } from "@/components/icons/compare.icon";
import { CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Paginator } from "@/components/ui/pagination";
import { RandomPieceAvailabilityTooltip } from "@/components/ui/random-piece-availability-tooltip";
import {
  type ComparedValue,
  type ICDPAllocatorFullReport,
  type ICDPAllocatorFullReportStorageProviderDistribution,
} from "@/lib/interfaces/cdp/cdp.interface";
import { type ArrayElement, bigintToPercentage } from "@/lib/utils";
import {
  createColumnHelper,
  type RowSelectionState,
} from "@tanstack/react-table";
import { filesize } from "filesize";
import Link from "next/link";
import { useMemo } from "react";

export interface ProviderTableProps {
  page: number;
  pageSize: number;
  report: ICDPAllocatorFullReport;
  reportToCompare?: ICDPAllocatorFullReport;
  totalPages?: number;
  onPageChange(nextPage: number): void;
  onPageSizeChange(nextPage: number): void;
}

interface EnrichedTableItem
  extends ICDPAllocatorFullReportStorageProviderDistribution {
  duplicationPercentage: number;
}

type ComparableField = ArrayElement<typeof comparableFields>;
type ComparedTableItem = Omit<EnrichedTableItem, ComparableField> & {
  [K in ComparableField]: ComparedValue<EnrichedTableItem[K]>;
};

const httpRetrievabilityColumnId = "http_retrievability";
const comparableFields = [
  "total_deal_size",
  "perc_of_total_datacap",
  "duplicationPercentage",
  "claims_count",
  "retrievability_success_rate_http",
  "retrievability_success_rate_url_finder",
] as const satisfies Array<keyof EnrichedTableItem>;

const columnHelper = createColumnHelper<ComparedTableItem>();
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
  columnHelper.accessor("perc_of_total_datacap", {
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
];

function enrichTableItem(
  tableItem: ICDPAllocatorFullReportStorageProviderDistribution
): EnrichedTableItem {
  const uniqueDataSize = BigInt(tableItem.unique_data_size);
  const totalDealSize = BigInt(tableItem.total_deal_size);

  return {
    ...tableItem,
    duplicationPercentage:
      bigintToPercentage(totalDealSize - uniqueDataSize, totalDealSize, 6) /
      100,
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
  givenItem: EnrichedTableItem,
  comparedItem?: EnrichedTableItem
): ComparedTableItem {
  const comparedEntries = comparableFields.map((field) => {
    return [field, compareValues(givenItem[field], comparedItem?.[field])];
  });

  return {
    ...givenItem,
    ...Object.fromEntries(comparedEntries),
  };
}

export function ProviderTable({
  page,
  pageSize,
  report,
  reportToCompare,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: ProviderTableProps) {
  const items = useMemo(() => {
    const enrichedItems =
      report.storage_provider_distribution.data.map(enrichTableItem);
    const comparedEnrichedItems = reportToCompare
      ? reportToCompare.storage_provider_distribution.data.map(enrichTableItem)
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
        columnVisibility={{
          [httpRetrievabilityColumnId]: !hideSparkRetrievability,
        }}
        data={items}
        rowSelection={rowSelection}
      />
      <CardFooter className="border-t w-full p-3">
        <Paginator
          page={page}
          pageSize={pageSize}
          pageSizeOptions={[10, 15, 25]}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          total={totalPages ?? 0}
        />
      </CardFooter>
    </div>
  );
}
