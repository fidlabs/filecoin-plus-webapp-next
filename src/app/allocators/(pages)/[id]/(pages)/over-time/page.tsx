import {
  AllocationsOverTimeChart
} from "@/app/allocators/(pages)/[id]/(pages)/over-time/components/allocations-over-time-chart";
import {getAllocatorById} from "@/lib/api";
import {Suspense} from "react";

interface IPageProps {
  params: { id: string }
}

const AllocatorOverTimeDetailsPage = async (props: IPageProps) => {

  const data = await getAllocatorById(props.params.id)

  return <Suspense>
    <AllocationsOverTimeChart data={data} allocatorId={props.params.id}/>
  </Suspense>
}

export default AllocatorOverTimeDetailsPage