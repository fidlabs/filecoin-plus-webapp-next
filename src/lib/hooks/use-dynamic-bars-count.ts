import { type RefCallback } from "react";
import { useRefWidth } from "./use-ref-width";

export interface UseDynamicBarsCountParameters {
  minBarSize: number;
  margins?: number;
}

export interface UseDynamicBarsCountReturnType<T extends HTMLElement> {
  barsCount: number;
  chartWrapperRef: RefCallback<T>;
}

export function useDynamicBarsCount<T extends HTMLElement>({
  minBarSize,
  margins = 0,
}: UseDynamicBarsCountParameters): UseDynamicBarsCountReturnType<T> {
  const { ref, width } = useRefWidth<T>();
  const chartWidth = width ?? 0;
  const availableWidth = Math.max(0, chartWidth - margins);
  const barsCount =
    minBarSize <= 0 ? Infinity : Math.floor(availableWidth / minBarSize);

  return {
    barsCount,
    chartWrapperRef: ref,
  };
}
