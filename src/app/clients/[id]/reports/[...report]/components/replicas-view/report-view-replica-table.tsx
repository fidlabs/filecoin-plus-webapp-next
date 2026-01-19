"use client";

import { CompareIcon } from "@/components/icons/compare.icon";
import { DataTable } from "@/components/ui/data-table";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  type ComparedValue,
  type IClientFullReport,
} from "@/lib/interfaces/cdp/cdp.interface";
import { type ArrayElement } from "@/lib/utils";
import { createColumnHelper, RowSelectionState } from "@tanstack/react-table";
import { filesize } from "filesize";
import { useMemo } from "react";

export interface ReportViewReplicaTableProps {
  report: IClientFullReport;
  reportToCompare?: IClientFullReport;
}

type RawItem = ArrayElement<IClientFullReport["replica_distribution"]>;
type ComparableField = ArrayElement<typeof comparableFields>;
type ComparedItem = Omit<RawItem, ComparableField> & {
  [K in ComparableField]: ComparedValue<RawItem[K]>;
};

const comparableFields = [
  "unique_data_size",
  "total_deal_size",
  "percentage",
] as const satisfies Array<keyof RawItem>;

const columnHelper = createColumnHelper<ComparedItem>();
const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});
const columns = [
  columnHelper.accessor("num_of_replicas", {
    header: "Providers",
  }),
  columnHelper.accessor("unique_data_size", {
    header() {
      return <span className="whitespace-nowrap">Unique Data</span>;
    },
    cell({ getValue, row }) {
      if (row.original.not_found) {
        return "N/A";
      }

      const uniqueDataSize = getValue();

      return (
        <div className="h-full flex items-center justify-start gap-1">
          {filesize(uniqueDataSize.value, { standard: "iec" })}
          <CompareIcon compare={uniqueDataSize.result} />
        </div>
      );
    },
  }),
  columnHelper.accessor("total_deal_size", {
    header() {
      return <span className="whitespace-nowrap">Total Deals</span>;
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
  columnHelper.accessor("percentage", {
    header: "Percentage",
    cell({ getValue, row }) {
      if (row.original.not_found) {
        return "N/A";
      }

      const percentage = getValue();

      return (
        <div className="h-full flex items-center justify-end gap-1">
          {percentageFormatter.format(percentage.value / 100)}
          <CompareIcon compare={percentage.result} />
        </div>
      );
    },
  }),
];

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

function compareRawItems(
  givenItem: RawItem,
  comparedItem?: RawItem
): ComparedItem {
  const comparedEntries = comparableFields.map((field) => {
    return [field, compareValues(givenItem[field], comparedItem?.[field])];
  });

  return {
    ...givenItem,
    ...Object.fromEntries(comparedEntries),
  };
}

export function ReportViewReplicaTable({
  report,
  reportToCompare,
}: ReportViewReplicaTableProps) {
  const items = useMemo(() => {
    return report.replica_distribution.map((item) => {
      const comparedItem = reportToCompare?.replica_distribution.find(
        (candidate) => item.num_of_replicas === candidate.num_of_replicas
      );

      return compareRawItems(item, comparedItem);
    });
  }, [report, reportToCompare]);

  const uniqueDataSum = items.reduce((sum, item) => {
    return item.not_found ? sum : sum + BigInt(item.unique_data_size.value);
  }, BigInt(0));

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
      <DataTable columns={columns} data={items} rowSelection={rowSelection}>
        <TableRow>
          <TableCell />
          <TableCell className="items-center h-full font-semibold">
            {filesize(uniqueDataSum, { standard: "iec" })} Total
          </TableCell>
          <TableCell />
          <TableCell />
        </TableRow>
      </DataTable>
    </div>
  );
}
