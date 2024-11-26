"use client"
import {Card, CardContent} from "@/components/ui/card";
import {GenericContentHeader} from "@/components/generic-content-view";
import {LoaderCircle} from "lucide-react";
import {useAllocatorDetails} from "@/app/allocators/(pages)/[id]/components/allocator.provider";
import {
  AllocationsOverTimeChart
} from "@/app/allocators/(pages)/[id]/(pages)/over-time/components/allocations-over-time-chart";
import {useEffect} from "react";
import {ScaleSelector} from "@/components/ui/scale-selector";
import {useChartScale} from "@/lib/hooks/useChartScale";

const AllocatorOverTimeDetailsPage = () => {

  const {chartData, fetchChartData, loading, minValue, tabs} = useAllocatorDetails()
  const {scale, selectedScale, setSelectedScale} = useChartScale(minValue)

  useEffect(() => {
    fetchChartData()
  }, [fetchChartData]);

  return <main className="main-content ">
    <Card>
      <GenericContentHeader placeholder="Client ID / Address / Name"
                            navigation={tabs}
                            selected={'chart'}
                            addons={<ScaleSelector scale={selectedScale} setScale={setSelectedScale}/>}
                            fixedHeight={false}/>
      <CardContent className="p-0">
        {
          loading && <div className="p-10 w-full flex flex-col items-center justify-center">
            <LoaderCircle className="animate-spin"/>
          </div>
        }
        {chartData && <AllocationsOverTimeChart scale={scale}/>}
      </CardContent>
    </Card>
  </main>

}

export default AllocatorOverTimeDetailsPage