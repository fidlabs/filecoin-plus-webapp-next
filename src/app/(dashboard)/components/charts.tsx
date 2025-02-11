import {DatacapAllocationChart} from "@/app/(dashboard)/components/datacap-allocation-chart";
import {DatacapAllocationWeeklyChart} from "@/app/(dashboard)/components/datacap-allocation-weekly-chart";
import {DataCapOverTimeChart} from "@/app/(dashboard)/components/datacap-over-time-chart";
import {
  IFilDCAllocationsWeekly,
  IFilDCAllocationsWeeklyByClient,
  IFilPlusStats
} from "@/lib/interfaces/dmob/dmob.interface";
import {IAllocatorsResponse} from "@/lib/interfaces/dmob/allocator.interface";
import {Suspense} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {ChartLoader} from "@/components/ui/chart-loader";

interface IChartsProps {
  stats: IFilPlusStats,
  allocationWeekly: IFilDCAllocationsWeekly,
  allocationWeeklyByClient: IFilDCAllocationsWeeklyByClient,
  allocators: IAllocatorsResponse
}

const Charts = async ({stats, allocationWeekly, allocationWeeklyByClient, allocators}: IChartsProps) => {
  return <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 content-evenly">
    <Suspense fallback={<Fallback/>}>
      <DatacapAllocationChart data={stats}/>
    </Suspense>
    <Suspense fallback={<Fallback/>}>
      <DatacapAllocationWeeklyChart data={allocationWeekly}/>
    </Suspense>
    <Suspense fallback={<Fallback/>}>
      <DataCapOverTimeChart data={allocationWeeklyByClient} allocators={allocators}/>
    </Suspense>
  </div>
}

const Fallback = () => {
  return <Card className="w-full min-h-96">
    <CardContent className="w-full h-full flex items-center justify-center">
      <ChartLoader/>
    </CardContent>
  </Card>
}

export {Charts}