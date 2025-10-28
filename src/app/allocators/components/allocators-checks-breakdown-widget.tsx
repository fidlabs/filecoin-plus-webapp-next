"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryKey } from "@/lib/constants";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import {
  fetchAllocatorsChecksBreakdown,
  type FetchAllocatorsChecksBreakdownParameters,
} from "../allocators-data";
import {
  AllocatorsChecksHistoricalChart,
  type AllocatorsChecksHistoricalChartProps,
} from "./allocators-check-historical-chart";
import { AllocatorsChecksSelect } from "./allocators-checks-select";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { OverlayLoader } from "@/components/overlay-loader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type CheckboxCheckedChangeHandler = NonNullable<
  ComponentProps<typeof Checkbox>["onCheckedChange"]
>;

type ChartMode = NonNullable<AllocatorsChecksHistoricalChartProps["mode"]>;
type CardProps = ComponentProps<typeof Card>;

export interface AllocatorsChecksBreakdownWidgetProps
  extends Omit<CardProps, "children"> {
  animationDuration?: number;
}

const chartModes = ["datacap", "checkCount"] as const satisfies ChartMode[];
const chartModesDict: Record<ChartMode, string> = {
  checkCount: "Count",
  datacap: "Datacap",
};
const syncCheckboxId = "allocators_check_charts_sync_checkbox";

export function AllocatorsChecksBreakdownWidget({
  animationDuration = 200,
  ...rest
}: AllocatorsChecksBreakdownWidgetProps) {
  const [parameters, setParameters] =
    useState<FetchAllocatorsChecksBreakdownParameters>({
      groupBy: "week",
    });
  const { data, isLoading } = useSWR(
    [QueryKey.ALLOCATORS_CHECKS_BREAKDOWN, parameters],
    ([, fetchParameters]) => fetchAllocatorsChecksBreakdown(fetchParameters),
    { keepPreviousData: true }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const [chartMode, setChartMode] = useState<string>(chartModes[0]);

  const visibleBreakdowns = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.filter((checksBreakdown) => {
      return selectedChecks.includes(checksBreakdown.check);
    });
  }, [data, selectedChecks]);

  const minIntervalsCount = useMemo(() => {
    const maxIntervals = visibleBreakdowns.reduce((max, breakdown) => {
      return Math.max(max, breakdown.data.length);
    }, 0);

    return Math.min(maxIntervals, 12);
  }, [visibleBreakdowns]);

  const handleSyncChecboxCheckedChange =
    useCallback<CheckboxCheckedChangeHandler>((checkedState) => {
      if (checkedState !== "indeterminate") {
        setSyncEnabled(checkedState);
      }
    }, []);

  const updateIntervalFilter = useCallback((value: string) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      groupBy: value === "week" ? "week" : "month",
    }));
  }, []);

  return (
    <Card {...rest}>
      <div className="p-4">
        <h2 className="text-lg font-medium">Alerts Breakdown</h2>
        <p className="text-xs text-muted-foregroud">
          Browse Allocators compliance breakdown by selected alerts metrics
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between px-4 mb-6">
        <AllocatorsChecksSelect
          availableChecks={data ?? []}
          selectedChecks={selectedChecks}
          onSelectedChecksChange={setSelectedChecks}
        />

        <div className="flex items-center gap-x-2 mb-2">
          <div className="flex items-center gap-x-1">
            <Checkbox
              id={syncCheckboxId}
              checked={syncEnabled}
              onCheckedChange={handleSyncChecboxCheckedChange}
            />
            <label htmlFor={syncCheckboxId} className="text-sm">
              Sync Charts
            </label>
          </div>

          <Tabs
            value={parameters.groupBy ?? "week"}
            onValueChange={updateIntervalFilter}
          >
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={chartMode} onValueChange={setChartMode}>
            <TabsList>
              {chartModes.map((chartMode) => (
                <TabsTrigger key={chartMode} value={chartMode}>
                  {chartModesDict[chartMode]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex flex-wrap relative min-h-[200px]">
        {visibleBreakdowns.map((checksBreakdown) => (
          <AllocatorsChecksHistoricalChart
            key={checksBreakdown.check}
            checkName={checksBreakdown.checkName}
            checkDescription={checksBreakdown.checkDescription}
            data={checksBreakdown.data}
            disableSync={!syncEnabled}
            interval={parameters.groupBy ?? "week"}
            mode={chartMode as ChartMode}
            minIntervalsCount={minIntervalsCount}
            animationDuration={animationDuration}
          />
        ))}

        {selectedChecks.length === 0 && (
          <p className="flex-1 text-center text-muted-foreground text-sm self-center justify-self-center">
            Select metrics above to see a graph for each of them.
          </p>
        )}

        <OverlayLoader show={!data || isLongLoading} />
      </div>

      <Accordion
        className={cn(visibleBreakdowns.length === 0 && "border-t")}
        type="single"
        collapsible
      >
        <AccordionItem value="data-disclaimer">
          <AccordionTrigger className="px-4 text-sm">
            About the data shown here
          </AccordionTrigger>
          <AccordionContent className="px-4 text-justify">
            <ul className="list-disc [&>li]:mb-1.5 pl-4">
              <li>
                Graphs shown above are based on alerts generated during
                allocators raports creation, and because of that datacap values
                may not be consistent. Do not treat the following graphs as a
                visualisation of all datacap owned by allocators.
              </li>
              <li>
                For some time periods only non compliant datacap amounts may be
                shown, because no other data was collected at that point.
              </li>
              <li>
                Some metrics may show less data points than others because the
                alerts system is evolving over time. New metrics may be added in
                the future, their definitions can change etc.
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
