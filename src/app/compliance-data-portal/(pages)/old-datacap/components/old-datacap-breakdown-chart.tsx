"use client";

import { StackedBarGraph } from "@/app/compliance-data-portal/components/graphs/stacked-bar-graph";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { filesize } from "filesize";
import Link from "next/link";
import { type ComponentProps, useCallback, useMemo, useState } from "react";

interface ChartDataItem {
  name: string;
  [key: string]: string | number;
}

type StackedBarGraphProps = ComponentProps<typeof StackedBarGraph>;

export interface OldDatacapBreakdownChartProps
  extends Omit<
    StackedBarGraphProps,
    "currentDataTab" | "data" | "isLoading" | "unit" | "onBarClick"
  > {
  chartData: ChartDataItem[];
  drilldown: Record<
    string,
    Array<{
      id: string;
      name: string;
      value: bigint | number | string;
    }>
  >;
  drilldownItemLabel: string;
  variant: "allocator" | "client";
}

export function OldDatacapBreakdownChart({
  chartData,
  drilldown,
  drilldownItemLabel,
  variant,
  ...rest
}: OldDatacapBreakdownChartProps) {
  const [selectedDataKey, setSelectedDataKey] = useState<string>();

  const selectedDrilldown = useMemo(() => {
    if (!selectedDataKey) {
      return;
    }

    return drilldown[selectedDataKey];
  }, [drilldown, selectedDataKey]);

  const handleBarClick = useCallback<
    NonNullable<StackedBarGraphProps["onBarClick"]>
  >((dataItem) => {
    setSelectedDataKey(dataItem.name);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSelectedDataKey(undefined);
    }
  }, []);

  return (
    <>
      <StackedBarGraph
        {...rest}
        currentDataTab="PiB"
        data={chartData}
        isLoading={false}
        unit="PiB"
        onBarClick={handleBarClick}
      />

      <Dialog open={!!selectedDrilldown} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="bg-white px-0">
          <DialogHeader className="px-6">
            <DialogTitle>{selectedDataKey} Breakdown</DialogTitle>
            <DialogDescription>
              {selectedDrilldown?.length}{" "}
              {variant === "allocator" ? "entities" : "clients"}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[500px] grid gap-2 px-6 overflow-y-auto overflow-x-hidden">
            {selectedDrilldown?.map((item) => (
              <div key={item.id}>
                <Button variant="link" asChild className="max-w-full truncate">
                  <Link
                    href={
                      variant === "allocator"
                        ? `/allocators/${item.id}`
                        : `/clients/${item.id}`
                    }
                    target="_blank"
                  >
                    {item.name}
                  </Link>
                </Button>
                <p className="text-sm">
                  <span className="text-muted-foreground">
                    {drilldownItemLabel}
                  </span>{" "}
                  {filesize(item.value, { standard: "iec" })}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
