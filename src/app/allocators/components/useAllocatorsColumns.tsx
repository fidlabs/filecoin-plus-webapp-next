import {DataTableSort} from "@/components/ui/data-table";
import Link from "next/link";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {calculateDateFromHeight, convertBytesToIEC} from "@/lib/utils";
import {CopyIcon} from "lucide-react";
import {ColumnDef} from "@tanstack/react-table";
import {IAllocator} from "@/lib/interfaces/dmob.interface";

type FilterCallback = (key: string, direction: string) => void;

export const useAllocatorsColumns = (filterCallback: FilterCallback) => {
  const columns = [
    {
      accessorKey: "addressId",
      header: () => {
        return (
          <DataTableSort property="addressId" setSorting={filterCallback}>
            Allocator ID
          </DataTableSort>
        )
      },
      cell: ({row}) => {
        const addressId = row.getValue('addressId') as string
        return <Link className="table-link" href={`allocators/${addressId}`}>{addressId}</Link>
      }
    }, {
      accessorKey: "name",
      header: () => {
        return (
          <DataTableSort property="name" setSorting={filterCallback}>
            Name
          </DataTableSort>
        )
      },
      cell: ({row}) => {
        const addressId = row.getValue('addressId') as string
        const name = row.getValue('name') as string
        if (name?.length > 20) {
          return <HoverCard openDelay={100} closeDelay={50}>
            <HoverCardTrigger>
              <Link className="table-link" href={`allocators/${addressId}`}>{name.slice(0, 20)}...</Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              {name}
            </HoverCardContent>
          </HoverCard>
        } else {
          return <Link className="table-link" href={`allocators/${addressId}`}>{name}</Link>
        }
      }
    }, {
      accessorKey: "orgName",
      header: () => {
        return (
          <DataTableSort property="orgName" setSorting={filterCallback}>
            Organization Name
          </DataTableSort>
        )
      },
      cell: ({row}) => {
        const orgName = row.getValue('orgName') as string
        if (orgName?.length > 20) {
          return <HoverCard openDelay={100} closeDelay={50}>
            <HoverCardTrigger>
              <p className="cursor-help">{orgName.slice(0, 20)}...</p>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              {orgName}
            </HoverCardContent>
          </HoverCard>
        } else {
          return <p className="cursor-help">{orgName}</p>
        }
      }
    }, {
      accessorKey: 'verifiedClientsCount',
      header: () => {
        return (
          <DataTableSort property="verifiedClientsCount" setSorting={filterCallback}>
            Verified Clients
          </DataTableSort>
        )
      },
      cell: ({row}) => {
        const verifiedClientsCount = row.getValue('verifiedClientsCount') as string
        return <HoverCard openDelay={100} closeDelay={50}>
          <HoverCardTrigger>
            <p className="cursor-help">{verifiedClientsCount}</p>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            Number of SP this client uses
          </HoverCardContent>
        </HoverCard>
      }
    }, {
      accessorKey: 'allowance',
      header: () => {
        return (
          <DataTableSort property="allowance" setSorting={filterCallback}>
            DataCap Available
          </DataTableSort>
        )
      },
      cell: ({row}) => {
        const allowance = row.getValue('allowance') as string
        return convertBytesToIEC(allowance)
      }
    }, {
      accessorKey: 'remainingDatacap',
      header: () => {
        return (
          <DataTableSort property="remainingDatacap" setSorting={filterCallback}>
            DataCap Remaining
          </DataTableSort>
        )
      },
      cell: ({row}) => {
        const remainingDatacap = row.getValue('remainingDatacap') as string
        return convertBytesToIEC(remainingDatacap)
      }
    }, {
      accessorKey: 'initialAllowance',
      header: () => {
        return (
          <DataTableSort property="initialAllowance" setSorting={filterCallback}>
            Total DataCap received
          </DataTableSort>
        )
      },
      cell: ({row}) => {
        const initialAllowance = row.getValue('initialAllowance') as string
        return convertBytesToIEC(initialAllowance)
      }
    }, {
      accessorKey: 'createdAtHeight',
      header: () => {
        return (
          <DataTableSort property="createdAtHeight" setSorting={filterCallback}>
            Create date
          </DataTableSort>
        )
      },
      cell: ({row}) => {
        const createdAtHeight = row.getValue('createdAtHeight') as string
        return <HoverCard openDelay={100} closeDelay={50}>
          <HoverCardTrigger>
            <p className="cursor-help whitespace-nowrap">{calculateDateFromHeight(+createdAtHeight)}</p>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            {createdAtHeight}
          </HoverCardContent>
        </HoverCard>
      }
    }, {
      accessorKey: 'address',
      header: () => {
        return (
          <DataTableSort property="address" setSorting={filterCallback}>
            Address
          </DataTableSort>
        )
      },
      cell: ({row}) => {
        const address = row.getValue('address') as string
        const addressShort = `${address.slice(0, 4)}...${address.slice(-4)}`
        return <div className="flex gap-2 items-center">
          <p className="whitespace-nowrap">{addressShort}</p>
          <button onClick={() => navigator.clipboard.writeText(address)}>
            <CopyIcon size={15} className="text-muted-foreground"/>
          </button>
        </div>
      }
    }
  ] as ColumnDef<IAllocator>[]

  const csvHeaders = [
    {
      key: 'addressId',
      label: 'Allocator ID'
    },
    {
      key: 'name',
      label: 'Name'
    },
    {
      key: 'orgName',
      label: 'Organization Name'
    },
    {
      key: 'verifiedClientsCount',
      label: 'Verified Clients'
    },
    {
      key: 'allowance',
      label: 'DataCap Available'
    },
    {
      key: 'remainingDatacap',
      label: 'DataCap Remaining'
    },
    {
      key: 'initialAllowance',
      label: 'Total DataCap received'
    },
    {
      key: 'createdAtHeight',
      label: 'Create date'
    },
    {
      key: 'address',
      label: 'Address'
    },
    {
      key: 'removed',
      label: 'Allocator deprecated'
    }
  ]

  return {columns, csvHeaders}
}