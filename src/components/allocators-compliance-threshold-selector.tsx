"use client";

import { InfoIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Slider } from "./ui/slider";

export interface AllocatorsComplianceThresholdSelectorProps {
  initialValue?: number;
  value?: number;
  onThresholdChange?(value: number): void;
}

export function AllocatorsComplianceThresholdSelector({
  initialValue = 50,
  value: controlledValue,
  onThresholdChange,
}: AllocatorsComplianceThresholdSelectorProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(initialValue);
  const handleValuesChange = useCallback(
    (values: number[]) => {
      const [value] = values;
      setUncontrolledValue(value);
      onThresholdChange?.(value);
    },
    [onThresholdChange]
  );

  const value =
    typeof controlledValue !== "undefined"
      ? controlledValue
      : uncontrolledValue;

  return (
    <div className="flex flex-col">
      <div className="flex gap-1 items-center justify-between">
        <p className="text-sm">Threshold: {value}%</p>
        <HoverCard>
          <HoverCardTrigger>
            <InfoIcon className="w-5 h-5 text-muted-foreground" />
          </HoverCardTrigger>
          <HoverCardContent>
            <p className="text-sm p-4 md:p-2 font-normal">
              Use this slider to adjust the threshold of SPs that need to be in
              compliance,
              <br />
              <p className="text-muted-foreground">
                eg. 50% means that half of the SPs receiving DC through this
                allocator meet the compliance metrics
              </p>
            </p>
          </HoverCardContent>
        </HoverCard>
      </div>
      <Slider
        className="min-w-[150px]"
        value={[value]}
        max={100}
        min={5}
        step={5}
        onValueChange={handleValuesChange}
      />
    </div>
  );
}
