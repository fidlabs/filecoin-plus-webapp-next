import {DatacapAllocationChart} from "@/app/(dashboard)/components/datacap-allocation-chart";
import {DatacapAllocationWeeklyChart} from "@/app/(dashboard)/components/datacap-allocation-weekly-chart";
import {DataCapOverTimeChart} from "@/app/(dashboard)/components/datacap-over-time-chart";
import {getAllocators, getDataCapAllocationsWeekly, getDataCapAllocationsWeeklyByClient, getStats} from "@/lib/api";
import {
  IFilDCAllocationsWeekly,
  IFilDCAllocationsWeeklyByClient,
  IFilPlusStats
} from "@/lib/interfaces/dmob/dmob.interface";
import {IAllocatorsResponse} from "@/lib/interfaces/dmob/allocator.interface";

type AllSettledResult = [PromiseFulfilledResult<IFilPlusStats>, PromiseFulfilledResult<IFilDCAllocationsWeekly>, PromiseFulfilledResult<IFilDCAllocationsWeeklyByClient>, PromiseFulfilledResult<IAllocatorsResponse>]

const Charts = async () => {

  const [stats, allocationWeekly, allocationWeeklyByClient, allocators] = await Promise.allSettled([await getStats(), await getDataCapAllocationsWeekly(), await getDataCapAllocationsWeeklyByClient(), await getAllocators({
    page: '1',
    showInactive: 'true',
  })]) as AllSettledResult

  return <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 content-evenly">
    <DatacapAllocationChart data={stats.value}/>
    <DatacapAllocationWeeklyChart data={allocationWeekly.value}/>
    <DataCapOverTimeChart data={allocationWeeklyByClient.value} allocators={allocators.value}/>
  </div>
}

export {Charts}