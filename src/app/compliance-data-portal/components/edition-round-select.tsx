"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditionRound } from "@/lib/hooks/cdp.hooks";

export function EditionRoundSelect() {
  const { selectedRoundId, onRoundChange, editionRounds } = useEditionRound();

  return (
    <div className="flex items-center mb-4 bg-white rounded-md p-6">
      <span className="mr-2">Edition:</span>
      <Select
        value={selectedRoundId ?? editionRounds[editionRounds.length - 1].id}
        onValueChange={onRoundChange}
      >
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
    </div>
  );
}
