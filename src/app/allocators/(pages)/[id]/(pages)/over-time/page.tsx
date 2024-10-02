"use client"
import {Card, CardContent} from "@/components/ui/card";
import {GenericContentHeader} from "@/components/generic-content-view";
import {LoaderCircle} from "lucide-react";
import {useAllocatorDetails} from "@/app/allocators/(pages)/[id]/components/allocator.provider";
import {AllocationsOverTimeChart} from "@/app/allocators/(pages)/[id]/(pages)/over-time/components/allocations-over-time-chart";
import {useEffect} from "react";
import {AllocatorsNavigation} from "@/app/allocators/(pages)/[id]/components/allocators-navigation";
import {ScaleSelector} from "@/components/ui/scale-selector";
import useChartScale from "@/lib/hooks/useChartScale";

interface IPageProps {
  params: { id: string }
}

const AllocatorOverTimeDetailsPage = (pageParams: IPageProps) => {
  const allocatorId = pageParams.params.id

  const {data, chartData, fetchChartData, loading, minValue} = useAllocatorDetails()

  const {scale, selectedScale, setSelectedScale} = useChartScale(minValue)

  useEffect(() => {
    fetchChartData()
  }, [fetchChartData]);

  return <Card>
    <GenericContentHeader placeholder="Client ID / Address / Name"
                          addons={<ScaleSelector scale={selectedScale} setScale={setSelectedScale}/>}
                          fixedHeight={false}>
      <div className="flex flex-row gap-6 items-baseline">
        <AllocatorsNavigation
          selected="chart"
          data={data}
          loading={loading}
          allocatorId={allocatorId}
        />
      </div>
    </GenericContentHeader>
    <CardContent className="p-0">
      {
        loading && <div className="p-10 w-full flex flex-col items-center justify-center">
          <LoaderCircle className="animate-spin"/>
        </div>
      }
      {chartData && <AllocationsOverTimeChart scale={scale}/>}
    </CardContent>
  </Card>

}

export default AllocatorOverTimeDetailsPage