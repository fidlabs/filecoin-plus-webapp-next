import { DashboardPageSectionId } from "@/lib/constants";
import { DatacapAllocationChart } from "./datacap-allocation-chart";
import { DatacapAllocationWeeklyChart } from "./datacap-allocation-weekly-chart";
import { DatacapOverTimeChart } from "./datacap-over-time-chart";

export function Charts() {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 content-evenly">
      <DatacapAllocationChart />
      <div
        className="lg:col-span-2"
        id={DashboardPageSectionId.DATACAP_ALLOCATIONS_OVER_TIME}
      >
        <DatacapAllocationWeeklyChart />
      </div>
      <DatacapOverTimeChart />
    </div>
  );
}
