"use client"
import {
  IClientReportCIDSharing,
} from "@/lib/interfaces/cdp/cdp.interface";
import {convertBytesToIEC} from "@/lib/utils";
import React, {useMemo} from "react";
import {ColumnDef, RowSelectionState} from "@tanstack/react-table";
import {DataTable} from "@/components/ui/data-table";
import {
  useReportsDetails
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {CompareIcon} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/compare.icon";
import Link from "next/link";

const comparableValues = ['up', 'down']

const useReportViewCidSharingColumns = (compareMode: boolean) => {
  const columns = [{
    accessorKey: "other_client",
    header: () => {
      return (
        <div className="whitespace-nowrap">
          Client
        </div>
      )
    }, cell: ({row}) => {
      const other_client = row.getValue('other_client') as number
      return <Link className="table-link" href={`/clients/${other_client}`}>{other_client}</Link>
    }
  }, {
    accessorKey: "total_deal_size",
    header: () => {
      return (
        <div className="whitespace-nowrap">
          Total deals affected
        </div>
      )
    },
    cell: ({row}) => {
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
    accessorKey: "unique_cid_count",
    header: () => {
      return (
        <div className="whitespace-nowrap">
          Unique CIDs
        </div>
      )
    }, cell: ({row}) => {
      if (row.original.not_found) {
        return <div className="h-full flex items-center justify-end gap-1">N/A</div>
      }

      const unique_cid_count = row.getValue('unique_cid_count') as number
      return <div className="h-full flex items-center justify-end gap-1">
        {unique_cid_count}
        {compareMode && <CompareIcon compare={row.original.unique_cid_count_compare}/>}
      </div>
    }
  }] as ColumnDef<IClientReportCIDSharing>[]

  return {columns}
}


interface IReportViewCidSharingTable {
  cidSharingData: IClientReportCIDSharing[]
}

const ReportViewCidSharingTable = ({cidSharingData}: IReportViewCidSharingTable) => {

  const {
    compareMode
  } = useReportsDetails()

  const {
    columns
  } = useReportViewCidSharingColumns(compareMode);

  const rowSelection = useMemo(() => {
    const selection = {} as RowSelectionState;
    if (!compareMode) {
      return selection
    }

    for (let i = 0; i < cidSharingData.length; i++) {
      const item = cidSharingData[i];
      selection[i] = comparableValues.includes(item.unique_cid_count_compare ?? 'equal') || comparableValues.includes(item.total_deal_size_compare ?? 'equal')
    }

    return selection
  }, [cidSharingData, compareMode])


  return <div className="border-b border-t table-select-warning">
    <DataTable columns={columns} data={cidSharingData} rowSelection={rowSelection}/>
  </div>
}

export {ReportViewCidSharingTable}