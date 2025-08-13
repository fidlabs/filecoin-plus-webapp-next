"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditionRound } from "@/lib/hooks/cdp.hooks";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function EditionRoundSelect() {
  const pathname = usePathname();

  const { selectedRound, setRound, editionRounds } = useEditionRound();
  const { filters, updateFilter } = useSearchParamsFilters();

  useEffect(() => {
    onChange(filters.roundId || selectedRound.id);
  }, [filters.roundId]);

  const onChange = (value: string) => {
    const selected = editionRounds.find((round) => round.id === value);

    if (selected) {
      setRound(selected);

      if (pathname.includes("ipni-misreporting")) {
        // Special case for IPNI Misreporting page (server component)
        updateFilter("roundId", selected.id, {
          navigationMethod: "push",
        });
      }
    }
  };

  return (
    <Select value={selectedRound.id} onValueChange={onChange}>
      <SelectTrigger className="bg-white text-black border border-gray-300 hover:bg-gray-100 gap-2">
        <SelectValue placeholder="test" />
      </SelectTrigger>
      <SelectContent>
        {editionRounds.map((round) => (
          <SelectItem key={`round_${round.id}`} value={round.id}>
            {round.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
