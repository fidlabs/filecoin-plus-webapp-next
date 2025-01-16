import {DatacapAllocationChart} from "@/app/(dashboard)/components/datacap-allocation-chart";
import {DatacapAllocationWeeklyChart} from "@/app/(dashboard)/components/datacap-allocation-weekly-chart";
import {DataCapOverTimeChart} from "@/app/(dashboard)/components/datacap-over-time-chart";
import {
  IFilDCAllocationsWeekly,
  IFilDCAllocationsWeeklyByClient,
  IFilPlusStats
} from "@/lib/interfaces/dmob/dmob.interface";
import {IAllocatorsResponse} from "@/lib/interfaces/dmob/allocator.interface";

interface IChartsProps {
  stats: IFilPlusStats,
  allocationWeekly: IFilDCAllocationsWeekly,
  allocationWeeklyByClient: IFilDCAllocationsWeeklyByClient,
  allocators: IAllocatorsResponse
}

const Charts = async ({stats, allocationWeekly, allocationWeeklyByClient, allocators}: IChartsProps) => {
  return <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 content-evenly">
    <DatacapAllocationChart data={stats}/>
    <DatacapAllocationWeeklyChart data={allocationWeekly}/>
    <DataCapOverTimeChart data={allocationWeeklyByClient} allocators={allocators}/>
  </div>
}

export {Charts}