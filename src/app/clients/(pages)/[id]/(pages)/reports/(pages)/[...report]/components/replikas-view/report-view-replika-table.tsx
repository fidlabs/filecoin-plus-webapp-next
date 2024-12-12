"use client"
import {
  IClientReportReplicaDistribution
} from "@/lib/interfaces/cdp/cdp.interface";
import {convertBytesToIEC} from "@/lib/utils";
import React, {useMemo} from "react";
import {ColumnDef, RowSelectionState} from "@tanstack/react-table";
import {DataTable} from "@/components/ui/data-table";
import {
  useReportsDetails
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {CompareIcon} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/compare.icon";

const comparableValues = ['up', 'down']

const useReportViewReplikasColumns = (compareMode: boolean) => {
  const columns = [{
    accessorKey: "num_of_replicas",
    header: () => {
      return (
        <div className="whitespace-nowrap">
          Providers
        </div>
      )
    }, cell: ({row}) => {
      const num_of_replicas = row.getValue('num_of_replicas') as number
      return <div>{num_of_replicas}</div>
    }
  }, {
    accessorKey: "unique_data_size",
    header: () => {
      return (
        <div className="whitespace-nowrap">
          Unique Data
        </div>
      )
    },
    cell: ({row}) => {
      if (row.original.not_found) {
        return <div className="h-full flex items-center justify-start gap-1">N/A</div>
      }

      const unique_data_size = row.getValue('unique_data_size') as number
      return <div className="h-full flex items-center justify-start gap-1">
        {convertBytesToIEC(unique_data_size)}
        {compareMode && <CompareIcon compare={row.original.unique_data_size_compare}/>}
      </div>
    }
  }, {
    accessorKey: "total_deal_size",
    header: () => {
      return (
        <div className="whitespace-nowrap">
          Total Deals
        </div>
      )
    }, cell: ({row}) => {
      if (row.original.not_found) {
        return <div className="h-full flex items-center justify-start gap-1">N/A</div>
      }

      const total_deal_size = row.getValue('total_deal_size') as number
      return <div className="h-full flex items-center justify-start gap-1">
        {convertBytesToIEC(total_deal_size)}
        {compareMode && <CompareIcon compare={row.original.total_deal_size_compare}/>}
      </div>
    }
  }, {
    accessorKey: "percentage",
    header: () => {
      return (
        <div className="whitespace-nowrap">
          Percentage
        </div>
      )
    }, cell: ({row}) => {
      if (row.original.not_found) {
        return <div className="h-full flex items-center justify-end gap-1">N/A</div>
      }

      const percentage = row.getValue('percentage') as number
      return <div className="h-full flex items-center justify-end gap-1">
        {percentage}%
        {compareMode && <CompareIcon compare={row.original.percentage_compare}/>}
      </div>
    }
  }] as ColumnDef<IClientReportReplicaDistribution>[]

  return {columns}
}


interface IReportViewReplicaTable {
  replikaData: IClientReportReplicaDistribution[]
}

const ReportViewReplicaTable = ({replikaData}: IReportViewReplicaTable) => {

  const {
    compareMode
  } = useReportsDetails()

  const {
    columns
  } = useReportViewReplikasColumns(compareMode);

  const rowSelection = useMemo(() => {
    const selection = {} as RowSelectionState;
    if (!compareMode) {
      return selection
    }

    for (let i = 0; i < replikaData.length; i++) {
      const item = replikaData[i];
      selection[i] = comparableValues.includes(item.unique_data_size_compare ?? 'equal') || comparableValues.includes(item.total_deal_size_compare ?? 'equal') || comparableValues.includes(item.percentage_compare ?? 'equal')
    }

    return selection
  }, [replikaData, compareMode])


  return <div className="border-b border-t">
    <DataTable columns={columns} data={replikaData} rowSelection={rowSelection}/>
  </div>
}

export {ReportViewReplicaTable}