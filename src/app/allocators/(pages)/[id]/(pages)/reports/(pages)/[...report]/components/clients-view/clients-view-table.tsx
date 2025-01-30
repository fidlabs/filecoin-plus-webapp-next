"use client"
import {
  ICDPAllocatorFullReportClient,
} from "@/lib/interfaces/cdp/cdp.interface";
import React, {useMemo} from "react";
import {ColumnDef, RowSelectionState} from "@tanstack/react-table";
import {DataTable} from "@/components/ui/data-table";
import Link from "next/link";
import {
  useReportsDetails
} from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {GithubIcon} from "@/components/icons/github.icon";
import {convertBytesToIEC} from "@/lib/utils";

// const comparableValues = ['up', 'down']

const useClientsViewColumns = (/*compareMode: boolean */) => {
  const columns = [{
    accessorKey: "client_id",
    header: () => {
      return (
        <div className="whitespace-nowrap">
          ID
        </div>
      )
    }, cell: ({row}) => {
      const client_id = row.getValue('client_id') as string
      const application_url = row.getValue('application_url') as string
      return <div className="flex flex-row items-center justify-start gap-1">
        <Link className="table-link" href={`/clients/${client_id}`}>{client_id}</Link>
        {application_url && <Link
          className="text-gray-500 hover:text-gray-900"
          target="_blank"
          href={application_url}><GithubIcon width={15} height={15}/></Link>}
      </div>
    }
  }, {
    accessorKey: "name",
    header: () => {
      return (
        <div className="whitespace-nowrap">
          Name
        </div>
      )
    }, cell: ({row}) => {
      const client_id = row.getValue('client_id')
      const name = row.getValue('name') as string
      return <Link className="table-link" href={`/clients/${client_id}`}>{name}</Link>
    }
  }, {
    accessorKey: "total_allocations",
    header: () => {
      return (
        <div className="whitespace-nowrap">
          Total allocations
        </div>
      )
    }, cell: ({row}) => {
      const total_allocations = row.getValue('total_allocations') as string
      return <span>{convertBytesToIEC(total_allocations)}</span>
    }
  }, {
    accessorKey: "allocations_number",
    header: () => {
      return (
        <div className="whitespace-nowrap">
          Number of allcoations
        </div>
      )
    }, cell: ({row}) => {
      const allocations_number = row.getValue('allocations_number') as number
      return <span>{allocations_number}</span>
    }
  }] as ColumnDef<ICDPAllocatorFullReportClient>[]

  return {columns}
}


interface IClientsViewTable {
  clients: ICDPAllocatorFullReportClient[]
}

const ClientsViewTable = ({clients}: IClientsViewTable) => {

  const {
    compareMode
  } = useReportsDetails()

  const {
    columns
  } = useClientsViewColumns();

  const rowSelection = useMemo(() => {
    const selection = {} as RowSelectionState;
    if (!compareMode) {
      return selection
    }

    for (let i = 0; i < clients.length; i++) {
      // const item = clients[i];
      // selection[i] = comparableValues.includes(item ?? 'equal') || comparableValues.includes(item.total_deal_size_compare ?? 'equal')
    }

    return selection
  }, [clients, compareMode])


  return <div className="border-b border-t table-select-warning">
    <DataTable columns={columns} data={clients} rowSelection={rowSelection}/>
  </div>
}

export {ClientsViewTable}