"use client";

import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { type Scale, useChartScale } from "@/lib/hooks/useChartScale";
import type { ComponentProps, ReactElement } from "react";

interface RenderProps {
  scale: Scale;
}

type ChartWrapperProps = ComponentProps<typeof ChartWrapper>;
export type OldDatacapChartWrapperProps = Omit<
  ChartWrapperProps,
  "children"
> & {
  renderContent(renderProps: RenderProps): ReactElement | null;
};

export function OldDatacapChartWrapper({
  renderContent,
  ...rest
}: OldDatacapChartWrapperProps) {
  const { scale, selectedScale, setSelectedScale } = useChartScale(10);

  return (
    <ChartWrapper
      {...rest}
      selectedScale={selectedScale}
      setSelectedScale={setSelectedScale}
      scales={["linear", "log"]}
    >
      {renderContent({ scale })}
    </ChartWrapper>
  );
}
