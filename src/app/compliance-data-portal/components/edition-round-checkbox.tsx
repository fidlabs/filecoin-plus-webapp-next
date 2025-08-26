"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useEditionRound } from "@/lib/hooks/cdp.hooks";
import { useState } from "react";

export function EditionRoundCheckbox() {
  const { onRoundChange, editionRounds } = useEditionRound();

  const [selectedRoundIds, setSelectedRoundIds] = useState(
    editionRounds.map((x) => x.id)
  );

  const handleOnRoundChange = (roundId: string, checked: boolean) => {
    const newSelectedRoundIds = checked
      ? [...selectedRoundIds, roundId]
      : selectedRoundIds.filter((id) => id !== roundId);

    if (newSelectedRoundIds.length === 0) {
      // Prevent unchecking all checkboxes
      return;
    }

    setSelectedRoundIds(newSelectedRoundIds);

    const allSelected = editionRounds.length === newSelectedRoundIds.length;

    if (allSelected) {
      onRoundChange(null);
      return;
    } else {
      const other = editionRounds.find((r) => r.id !== roundId);
      if (other) {
        onRoundChange(other.id);
      }
    }
  };

  return (
    <>
      <div className="flex items-center mb-4 bg-white rounded-md p-6">
        <span className="mr-2">Edition:</span>
        {editionRounds.map((round) => {
          return (
            <div key={round.id} className="flex items-center gap-2 mr-4">
              <Checkbox
                checked={selectedRoundIds.includes(round.id)}
                onCheckedChange={(checked) => {
                  handleOnRoundChange(round.id, !!checked);
                }}
              />
              <span>{round.name}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
