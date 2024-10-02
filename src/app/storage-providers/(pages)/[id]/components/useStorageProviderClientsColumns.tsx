import {DataTableSort} from "@/components/ui/data-table";
import Link from "next/link";
import {ColumnDef} from "@tanstack/react-table";
import {calculateDateFromHeight, convertBytesToIEC} from "@/lib/utils";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {InfoIcon} from "lucide-react";
import {IStorageProviderClient} from "@/lib/interfaces/dmob/sp.interface";

type FilterCallback = (key: string, direction: string) => void;

export const useStorageProviderClientsColumns = (filterCallback: FilterCallback) => {
  const columns = [
    {
      accessorKey: "client",
      header: () => {
        return (
          <DataTableSort property="client" setSorting={filterCallback}>
            Verified Client ID
          </DataTableSort>
        )
      },
      cell: ({row}) => {
        const client = row.getValue('client') as string
        return <Link className="table-link" href={`/clients/${client}`}>{client}</Link>
      }
    },
    {
      accessorKey: "noOfVerifiedDeals",
      header: () => {
        return (
          <DataTableSort property="noOfVerifiedDeals" setSorting={filterCallback}>
            Deals
          </DataTableSort>
        )
      },
      cell: ({row}) => {
        const noOfVerifiedDeals = row.getValue('noOfVerifiedDeals') as string
        return <p>{noOfVerifiedDeals}</p>
      }
    },
    {
      accessorKey: 'verifiedDealsTotalSize',
      header: () => {
        return (
          <DataTableSort property="verifiedDealsTotalSize" setSorting={filterCallback}>
            Verified Deals Total Size
          </DataTableSort>
        )
      }, cell: ({row}) => {
        const verifiedDealsTotalSize = row.getValue('verifiedDealsTotalSize') as string
        return <p>{convertBytesToIEC(verifiedDealsTotalSize)}</p>
      }
    },
    {
      accessorKey: 'lastDealHeight',
      header: () => {
        return (
          <DataTableSort property="lastDealHeight" setSorting={filterCallback}>
            Last Deal Date
          </DataTableSort>
        )
      }, cell: ({row}) => {
        const lastDealHeight = row.getValue('lastDealHeight') as string
        return <div className="whitespace-nowrap flex gap-1 items-center">
          {calculateDateFromHeight(+lastDealHeight)}
          <HoverCard openDelay={100} closeDelay={50}>
            <HoverCardTrigger>
              <InfoIcon size={15} className="text-muted-foreground cursor-help"/>
            </HoverCardTrigger>
            <HoverCardContent className="w-32">
              <p>Block height</p>
              <p>{lastDealHeight}</p>
            </HoverCardContent>
          </HoverCard>
        </div>
      }
    }
  ] as ColumnDef<IStorageProviderClient>[]

  const csvHeaders = [
    {
      label: 'Verified Client ID',
      key: 'concat'
    }, {
      label: 'Deals',
      key: 'noOfVerifiedDeals'
    }, {
      label: 'Verified Deals Total Size',
      key: 'verifiedDealsTotalSize'
    }, {
      label: 'Last Deal Date',
      key: 'lastDealHeight'
    }
  ]

  return {columns, csvHeaders}
}