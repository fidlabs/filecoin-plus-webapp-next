"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { useCallback, useState } from "react";

interface MetricMetadata {
  metric: string;
  metricName: string;
}

type CheckSelectHandler = (check: string) => void;

export interface AllocatorsScoringMetricsSelectProps {
  availableMetrics: MetricMetadata[];
  selectedMetrics: string[];
  onSelectedMetricsChange(selectedMetrics: string[]): void;
}

export function AllocatorsScoringMetricsSelect({
  availableMetrics,
  selectedMetrics,
  onSelectedMetricsChange,
}: AllocatorsScoringMetricsSelectProps) {
  const [open, setOpen] = useState(false);

  const selectAll = useCallback(() => {
    onSelectedMetricsChange(
      availableMetrics.map((metricMetadata) => metricMetadata.metric)
    );
  }, [availableMetrics, onSelectedMetricsChange]);

  const deselectAll = useCallback(() => {
    onSelectedMetricsChange([]);
  }, [onSelectedMetricsChange]);

  const handleMetricSelect = useCallback<CheckSelectHandler>(
    (metric) => {
      const foundIndex = selectedMetrics.findIndex(
        (candidate) => candidate === metric
      );
      const nextSelectedMetrics =
        foundIndex !== -1
          ? selectedMetrics.toSpliced(foundIndex, 1)
          : [...selectedMetrics, metric];
      onSelectedMetricsChange(nextSelectedMetrics);
    },
    [onSelectedMetricsChange, selectedMetrics]
  );

  return (
    <div className="flex flex-wrap gap-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
            disabled={availableMetrics.length === 0}
          >
            {selectedMetrics.length > 0
              ? `${selectedMetrics.length} metric${selectedMetrics.length === 1 ? "" : "s"} selected`
              : "Select metrics..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search metrics..." className="h-9" />
            <CommandList>
              <CommandEmpty>No metrics match the search phrase.</CommandEmpty>
              <CommandGroup>
                {availableMetrics.map((availableMetric) => (
                  <CommandItem
                    key={availableMetric.metric}
                    value={availableMetric.metric}
                    onSelect={handleMetricSelect}
                    className="text-xs cursor-pointer"
                  >
                    {availableMetric.metricName}
                    <CheckIcon
                      className={cn(
                        "ml-auto",
                        selectedMetrics.includes(availableMetric.metric)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button
        className="ml-2"
        variant="ghost"
        disabled={availableMetrics.length === 0}
        onClick={selectAll}
      >
        Select All
      </Button>
      <Button
        variant="ghost"
        disabled={availableMetrics.length === 0}
        onClick={deselectAll}
      >
        Clear
      </Button>
    </div>
  );
}
