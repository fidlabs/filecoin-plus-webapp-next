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
import {format} from "date-fns";
import {ResponsiveDialog, ResponsiveDialogContent, ResponsiveDialogTrigger} from "@/components/ui/responsive-dialog";
import {Button} from "@/components/ui/button";
import {InfoIcon} from "lucide-react";
import {Table, TableCell, TableHead, TableRow} from "@/components/ui/table";

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
      const application_url = row.original.application_url as string
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
      return <div className="flex gap-1 items-center justify-start">
        <span>{allocations_number}</span>
        <ResponsiveDialog>
          <ResponsiveDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="w-7 h-7"><InfoIcon
              className="text-muted-foreground w-4 h-4"/></Button>
          </ResponsiveDialogTrigger>
          <ResponsiveDialogContent>
            <div className="p-4">
              <Table>
                <TableRow>
                  <TableHead>
                    Date
                  </TableHead>
                  <TableHead>
                    DataCap
                  </TableHead>
                </TableRow>
                {row.original.allocations.map((allocation, index) => {
                  return <TableRow key={index}>
                    <TableCell>
                      {format(allocation.timestamp, 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {convertBytesToIEC(allocation.allocation)}
                    </TableCell>
                  </TableRow>
                })}
              </Table>
            </div>
          </ResponsiveDialogContent>
        </ResponsiveDialog>
      </div>
    }
  }, {
    accessorKey: "application_timestamp",
    header: () => {
      return (
        <div className="whitespace-nowrap">
          Date of application
        </div>
      )
    }, cell: ({row}) => {
      const application_timestamp = row.getValue('application_timestamp') as string
      return <span>{format(application_timestamp, 'dd/MM/yyyy HH:mm')}</span>
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