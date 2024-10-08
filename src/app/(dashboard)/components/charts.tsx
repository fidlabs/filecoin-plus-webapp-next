import {Suspense} from "react";
import {DatacapAllocationChart} from "@/app/(dashboard)/components/datacap-allocation-chart";
import {DatacapAllocationWeeklyChart} from "@/app/(dashboard)/components/datacap-allocation-weekly-chart";
import {DataCapOverTimeChart} from "@/app/(dashboard)/components/datacap-over-time-chart";

const Charts = () => {
  return <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 content-evenly">
    <Suspense>
      <DatacapAllocationChart/>
    </Suspense>
    <Suspense>
      <DatacapAllocationWeeklyChart/>
    </Suspense>
    <Suspense>
      <DataCapOverTimeChart />
    </Suspense>
  </div>
}

export {Charts}