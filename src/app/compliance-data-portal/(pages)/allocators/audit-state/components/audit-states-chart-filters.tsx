"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

export type AuditStatesChartFiltersProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
>;

export function AuditStatesChartFilters({
  className,
  ...rest
}: AuditStatesChartFiltersProps) {
  const { filters, updateFilter } = useSearchParamsFilters();
  const { showInactive, showAuditedOnly } = filters;

  return (
    <div {...rest} className={cn("flex flex-wrap gap-x-4 gap-y-1", className)}>
      <div className="flex gap-1 items-center">
        <Checkbox
          id="show-inactive"
          checked={showInactive === "true"}
          onCheckedChange={(checkedState) => {
            updateFilter(
              "showInactive",
              checkedState === true ? "true" : undefined
            );
          }}
        >
          Show inactive
        </Checkbox>
        <label htmlFor="show-inactive">Show inactive allocators</label>
      </div>
      <div className="flex gap-1 items-center">
        <Checkbox
          id="show-audited-only"
          checked={showAuditedOnly === "true"}
          onCheckedChange={(checkedState) => {
            updateFilter(
              "showAuditedOnly",
              checkedState === true ? "true" : undefined
            );
          }}
        >
          Show active
        </Checkbox>
        <label htmlFor="show-audited-only">Show only audited allocators</label>
      </div>
    </div>
  );
}
