"use client";
import {DataTable} from "@/components/ui/data-table";
import {
  useClientAllocatorsColumns
} from "@/app/clients/(pages)/[id]/(pages)/allocations/components/useClientAllocatorsColumns";
import {IClientAllocationsResponse} from "@/lib/interfaces/dmob/client.interface";

interface IProps {
  allocationsData: IClientAllocationsResponse
}

const AllocatorsListTable = ({allocationsData}: IProps) => {
  const {columns} = useClientAllocatorsColumns()

  return <div>
    <DataTable columns={columns} data={allocationsData?.data}/>
  </div>
}

export {AllocatorsListTable}