"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { useCallback, type ReactNode } from "react";

export interface RetrievabilityTypeSelectProps {
  defaultValue?: string;
  label?: ReactNode;
  queryParamName?: string;
}

const retrievabilityType = ["http", "urlFinder"] as const;
const availableValues = retrievabilityType as unknown as string[];

export function RetrievabilityTypeSelect({
  defaultValue = "urlFinder",
  label = null,
  queryParamName = "retrievabilityType",
}: RetrievabilityTypeSelectProps) {
  const { filters, updateFilter } = useSearchParamsFilters();

  const value =
    !!filters[queryParamName] &&
    availableValues.includes(filters[queryParamName])
      ? filters[queryParamName]
      : defaultValue;

  const handleRetrievabilityTypeChange = useCallback(
    (value: string) => {
      updateFilter(queryParamName, value);
    },
    [updateFilter, queryParamName]
  );

  return (
    <div className="flex items-center w-fit">
      {!!label && <span className="mr-2">{label}</span>}

      <Select value={value} onValueChange={handleRetrievabilityTypeChange}>
        <SelectTrigger className="bg-white text-black border border-gray-300 hover:bg-gray-100 gap-2 w-[150px]">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {availableValues.map((type) => (
            <SelectItem
              key={`select_item_retrieveability_type_${type}`}
              value={type}
            >
              {type === "urlFinder" ? "RPA" : "HTTP"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
