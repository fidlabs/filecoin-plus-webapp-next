import {DataTableSort} from "@/components/ui/data-table";
import Link from "next/link";
import {convertBytesToIEC} from "@/lib/utils";
import {ColumnDef} from "@tanstack/react-table";
import {IClientDeal} from "@/lib/interfaces/dmob/client.interface";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";

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
      cell: ({row}) => {
        const pieceCid = row.getValue('pieceCid') as string
        return <>
          <HoverCard>
            <HoverCardTrigger>
              <p className="sm:hidden">{pieceCid.substring(0, 5)}...{pieceCid.slice(-5)}</p>
              <p className="hidden sm:block md:hidden">{pieceCid.substring(0, 10)}...{pieceCid.slice(-10)}</p>
            </HoverCardTrigger>
            <HoverCardContent>
              <p className="break-words">{pieceCid}</p>
            </HoverCardContent>
          </HoverCard>
          <p className="hidden md:block">{pieceCid}</p>
        </>
      }
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
    }, {
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