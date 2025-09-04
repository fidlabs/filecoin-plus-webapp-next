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

type Round = (typeof rounds)[number];

export interface EditionRoundSelectProps {
  defaultValue?: Round;
  label?: ReactNode;
  queryParamName?: string;
}

const rounds = ["5", "6"] as const;
const availableValues = rounds as unknown as string[];

export function EditionRoundSelect({
  defaultValue = "6",
  label = null,
  queryParamName = "editionId",
}: EditionRoundSelectProps) {
  const { filters, updateFilter } = useSearchParamsFilters();
  const value =
    !!filters[queryParamName] &&
    availableValues.includes(filters[queryParamName])
      ? filters[queryParamName]
      : defaultValue;

  const handleRoundChange = useCallback(
    (value: string) => {
      updateFilter(queryParamName, value);
    },
    [updateFilter, queryParamName]
  );

  return (
    <div className="flex items-center">
      {!!label && <span className="mr-2">{label}</span>}

      <Select value={value} onValueChange={handleRoundChange}>
        <SelectTrigger className="bg-white text-black border border-gray-300 hover:bg-gray-100 gap-2">
          <SelectValue placeholder="Select edition round..." />
        </SelectTrigger>
        <SelectContent>
          {availableValues.map((round) => (
            <SelectItem key={`select_item_round_${round}`} value={round}>
              Round {round}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
