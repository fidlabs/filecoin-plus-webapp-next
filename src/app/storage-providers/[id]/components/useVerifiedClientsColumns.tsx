import {DataTableSort} from "@/components/ui/data-table";
import Link from "next/link";
import {ColumnDef} from "@tanstack/react-table";
import {IVerifiedClient} from "@/lib/interfaces/dmob.interface";
import {calculateDateFromHeight} from "@/lib/utils";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {InfoIcon} from "lucide-react";

type FilterCallback = (key: string, direction: string) => void;

export const useVerifiedClientsColumns = (filterCallback: FilterCallback) => {
  const columns = [
    {
      accessorKey: "concat",
      header: () => {
        return (
          <DataTableSort property="concat" setSorting={filterCallback}>
            Verified Client ID
          </DataTableSort>
        )
      },
      cell: ({row}) => {
        const concat = row.getValue('concat') as string
        return <Link className="table-link" href={`/clients/${concat}`}>{concat}</Link>
      }
    }, {
      accessorKey: "no_of_deals",
      header: () => {
        return (
          <DataTableSort property="no_of_deals" setSorting={filterCallback}>
            Deals
          </DataTableSort>
        )
      },
      cell: ({row}) => {
        const no_of_deals = row.getValue('no_of_deals') as string
        return <p>{no_of_deals}</p>
      }
    }, {
      accessorKey: 'lastdealstart',
      header: () => {
        return (
          <DataTableSort property="lastdealstart" setSorting={filterCallback}>
            Last Deal Start
          </DataTableSort>
        )
      }, cell: ({row}) => {
        const lastdealstart = row.getValue('lastdealstart') as string
        return <div className="whitespace-nowrap flex gap-1 items-center">
          {calculateDateFromHeight(+lastdealstart)}
          <HoverCard openDelay={100} closeDelay={50}>
            <HoverCardTrigger>
              <InfoIcon size={15} className="text-muted-foreground cursor-help"/>
            </HoverCardTrigger>
            <HoverCardContent className="w-32">
              <p>Block height</p>
              <p>{lastdealstart}</p>
            </HoverCardContent>
          </HoverCard>
        </div>
      }
    }
  ] as ColumnDef<IVerifiedClient>[]

  const csvHeaders = [
    {
      label: 'Verified Client ID',
      key: 'concat'
    }, {
      label: 'Deals',
      key: 'no_of_deals'
    }, {
      label: 'Last Deal Start',
      key: 'lastdealstart'
    }
  ]

  return {columns, csvHeaders}
}