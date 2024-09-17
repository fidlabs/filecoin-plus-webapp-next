"use client"
import {Card, CardContent} from "@/components/ui/card";
import {GenericContentFooter, GenericContentHeader} from "@/components/generic-content-view";
import {getClients} from "@/lib/api";
import {LoaderCircle} from "lucide-react";
import {useAllocatorDetails} from "@/app/allocators/[id]/components/allocator.provider";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import Link from "next/link";
import {AllocationsOverTimeChart} from "@/app/allocators/[id]/over-time/components/allocations-over-time-chart";
import {useEffect} from "react";

interface IPageProps {
  params: { id: string }
}

const AllocatorOverTimeDetailsPage = (pageParams: IPageProps) => {
  const allocatorId = pageParams.params.id

  const {data, chartData, fetchChartData, loading} = useAllocatorDetails()

  useEffect(() => {
    fetchChartData()
  }, [fetchChartData]);

  return <Card>
    <GenericContentHeader placeholder="Client ID / Address / Name"
                          fixedHeight={false}>
      <div className="flex flex-row gap-6 items-baseline">
        <Tabs value="chart">
          <TabsList>
            <TabsTrigger asChild value="list">
              <Link href={`/allocators/${allocatorId}`}>
                <h2 className="text-xl font-normal text-black leading-none flex items-center gap-2">
                  <p>
                    {loading && !data && <LoaderCircle size={15} className="animate-spin"/>}
                    {data?.count}
                  </p>
                  <p>Verified Clients</p>
                </h2>
              </Link>
            </TabsTrigger>
            <TabsTrigger asChild value="chart">
              <Link href={`/allocators/${allocatorId}/over-time`}>
                <h1 className="text-xl text-black leading-none font-normal flex items-center gap-2">
                  <p>Allocations over time</p>
                </h1>
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </GenericContentHeader>
    <CardContent className="p-0">
      {
        loading && <div className="p-10 w-full flex flex-col items-center justify-center">
          <LoaderCircle className="animate-spin"/>
        </div>
      }
      {chartData && <AllocationsOverTimeChart />}
    </CardContent>
  </Card>

}

export default AllocatorOverTimeDetailsPage