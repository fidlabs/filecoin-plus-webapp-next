"use client"
import {useGoogleTrustLevels} from "@/lib/hooks/google.hooks";
import {ChartWrapper} from "@/app/compliance-data-portal/components/chart-wrapper";
import {StackedBarGraph} from "@/components/charts/compliance/graphs/stacked-bar-graph";

interface Props {
  currentElement?: string;
  plain?: boolean;
}

const AllocatorTrustLevels = ({currentElement, plain}: Props) => {
  const {results, loading} = useGoogleTrustLevels();

  if (!!currentElement && currentElement !==  'TrustLevelAllocator') {
    return null;
  }

  return <ChartWrapper
    title="How much we trust allocators"
    id="TrustLevelAllocator"
    plain={plain}
  >
    <StackedBarGraph data={results} unit="Allocator" isLoading={loading} customPalette={[
      '#525252', '#ff0029', '#cf8c00', '#66a61e'
    ]}/>
  </ChartWrapper>;
};

export {AllocatorTrustLevels};
