import Link from "next/link";
import {convertBytesToIEC} from "@/lib/utils";
import {ColumnDef} from "@tanstack/react-table";
import {IClient} from "@/lib/interfaces/dmob/client.interface";

export const useClientAllocatorsColumns = () => {
  const columns = [
    {
      accessorKey: "verifierAddressId",
      header: () => {
        return (
          <div>
            Allocator ID
          </div>
        )
      },
      cell: ({row}) => {
        const verifierAddressId = row.getValue('verifierAddressId') as string
        return <Link className="table-link" href={`/allocators/${verifierAddressId}`}>{verifierAddressId}</Link>
      }
    }, {
      accessorKey: 'initialAllowance',
      header: () => {
        return (
          <div>
            Total size
          </div>
        )
      },
      cell: ({row}) => {
        const initialAllowance = row.getValue('initialAllowance') as string
        return convertBytesToIEC(initialAllowance)
      }
    }
  ] as ColumnDef<IClient>[]

  return {columns}
}