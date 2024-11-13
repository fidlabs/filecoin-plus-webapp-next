import {useScrollObserver} from "@/lib/hooks/useScrollObserver";
import {useStorageProviderRetrievability} from "@/lib/hooks/cdp.hooks";
import {useEffect} from "react";
import {TabsSelector} from "@/components/ui/tabs-selector";
import useWeeklyChartData from "@/app/compliance-data-portal/hooks/useWeeklyChartData";
import {useChartScale} from "@/lib/hooks/useChartScale";
import {StackedBarGraph} from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

interface Props {
  setCurrentElement: (val: string) => void
}

const StorageProviderRetrievability = ({setCurrentElement}: Props) => {

  const {
    data, isLoading
  } = useStorageProviderRetrievability()

  const {top, ref} = useScrollObserver()
  const {chartData, currentTab, setCurrentTab, tabs, minValue} = useWeeklyChartData(data?.buckets, '%')
  const {scale} = useChartScale(minValue)

  useEffect(() => {
    if (top > 0 && top < 300) {
      setCurrentElement("RetrievabilityScoreSP");
    }
  }, [setCurrentElement, top]);


  return <div className="w-full mt-2" id="RetrievabilityScoreSP" ref={ref}>
    <Card>
      <CardHeader>
        <CardTitle className="flex w-full justify-between">
          <div>Retrievability Score</div>
          <div className="chartHeaderOptions">
            <TabsSelector tabs={tabs} currentTab={currentTab} setCurrentTab={setCurrentTab}/>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Card alternate>
            <CardHeader>
              <CardTitle>
                Average success rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.avgSuccessRatePct?.toFixed(2)}%
            </CardContent>
          </Card>
          <Card alternate>
            <CardHeader>
              <CardTitle>
                Total providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.count}
            </CardContent>
          </Card>
        </div>
        <StackedBarGraph data={chartData} scale={scale} isLoading={isLoading} unit="providers"/>

      </CardContent>
    </Card>
  </div>

}

export default StorageProviderRetrievability;
