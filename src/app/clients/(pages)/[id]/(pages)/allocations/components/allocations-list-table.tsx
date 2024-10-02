import {LoaderCircle} from "lucide-react";
import {DataTable} from "@/components/ui/data-table";
import {useClientDetails} from "@/app/clients/(pages)/[id]/components/client.provider";
import {
  useClientAllocationsColumns
} from "@/app/clients/(pages)/[id]/(pages)/allocations/components/useClientAllocationsColumns";
import {useMemo} from "react";


const AllocationsListTable = () => {

  const {allocationsData, loading} = useClientDetails()
  const {columns} = useClientAllocationsColumns()

  const data = useMemo(() => {
    if (!allocationsData) {
      return null
    }

    return allocationsData?.data.flatMap((item) => item.allowanceArray)
  }, [allocationsData])

  return <div className="lg:max-h-[50vh] overflow-y-auto overflow-x-hidden">
    {
      loading && <div className="p-10 w-full flex flex-col items-center justify-center">
        <LoaderCircle className="animate-spin"/>
      </div>
    }
    {data && <DataTable columns={columns} data={data}/>}
  </div>
}

export {AllocationsListTable}