"use client";

import { ChartAreaIcon, ChartColumnIcon } from "lucide-react";
import {
  ComponentType,
  createElement,
  useCallback,
  type ComponentProps,
} from "react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export type ChartType = (typeof chartTypes)[number];
type TabsProps = ComponentProps<typeof Tabs>;
export interface ChartTypeTabsSelectProps<T extends ChartType[]>
  extends Omit<TabsProps, "children" | "onValueChange" | "value"> {
  chartType: T[number];
  enable?: T;
  onChartTypeChange(value: T[number]): void;
}

const chartTypes = ["area", "bar"] as const;
const chartTypeIconMap: Record<
  ChartType,
  ComponentType<{ className?: string }>
> = {
  area: ChartAreaIcon,
  bar: ChartColumnIcon,
};

export function ChartTypeTabsSelect<T extends ChartType[]>({
  chartType,
  enable,
  onChartTypeChange: onValueChange,
  ...rest
}: ChartTypeTabsSelectProps<T>) {
  const handleValueChange = useCallback(
    (value: string) => {
      onValueChange(value as T[number]);
    },
    [onValueChange]
  );

  return (
    <Tabs {...rest} value={chartType} onValueChange={handleValueChange}>
      <TabsList>
        {chartTypes.map((chartType) => {
          if (!!enable && !enable.includes(chartType)) {
            return null;
          }

          return (
            <TabsTrigger key={chartType} value={chartType}>
              {createElement(chartTypeIconMap[chartType], {
                className: "h-4 w-4",
              })}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
