import {DataTableSort} from "@/components/ui/data-table";
import Link from "next/link";
import {convertBytesToIEC} from "@/lib/utils";
import {ColumnDef} from "@tanstack/react-table";
import {IClientDeal} from "@/lib/interfaces/dmob/client.interface";

type FilterCallback = (key: string, direction: string) => void;

export const useDataCapClaimsColumns = (filterCallback: FilterCallback) => {
  const columns = [
    {
      accessorKey: "pieceCid",
      header: () => {
        return (
          <DataTableSort property="pieceCid" setSorting={filterCallback}>
            Piece CID
          </DataTableSort>
        )
      },
    }, {
      accessorKey: "providerId",
      header: () => {
        return (
          <DataTableSort property="providerId" setSorting={filterCallback}>
            Storage Provider ID
          </DataTableSort>
        )
      },
      cell: ({row}) => {
        const providerId = `f0${row.getValue('providerId')}` as string
        return <Link className="table-link" href={`/storage-providers/${providerId}`}>{providerId}</Link>
      }
    },{
      accessorKey: 'pieceSize',
      header: () => {
        return (
          <DataTableSort property="pieceSize" setSorting={filterCallback}>
            Size
          </DataTableSort>
        )
      },
      cell: ({row}) => {
        const pieceSize = row.getValue('pieceSize') as string
        return <p>{convertBytesToIEC(pieceSize)}</p>
      }
    },
  ] as ColumnDef<IClientDeal>[]

  const csvHeaders = [
    {label: 'Piece CID', key: 'pieceCid'},
    {label: 'Storage Provider ID', key: 'providerId'},
    {label: 'Size', key: 'pieceSize'},
  ]

  return {columns, csvHeaders}
}