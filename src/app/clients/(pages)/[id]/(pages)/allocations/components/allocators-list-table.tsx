import {LoaderCircle} from "lucide-react";
import {DataTable} from "@/components/ui/data-table";
import {useClientDetails} from "@/app/clients/(pages)/[id]/components/client.provider";
import {
  useClientAllocatorsColumns
} from "@/app/clients/(pages)/[id]/(pages)/allocations/components/useClientAllocatorsColumns";


const AllocatorsListTable = () => {

  const {allocationsData, loading} = useClientDetails()
  const {columns} = useClientAllocatorsColumns()


  return <div>
    {
      loading && <div className="p-10 w-full flex flex-col items-center justify-center">
        <LoaderCircle className="animate-spin"/>
      </div>
    }
    {allocationsData && <DataTable columns={columns} data={allocationsData?.data}/>}
  </div>
}

export {AllocatorsListTable}