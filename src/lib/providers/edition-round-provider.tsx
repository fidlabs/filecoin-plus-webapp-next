"use client";

import { createContext, ReactNode, useContext } from "react";
import { useSearchParamsFilters } from "../hooks/use-search-params-filters";

export interface EditionRound {
  id: string;
  name: string;
}

interface EditionRoundContextType {
  editionRounds: EditionRound[];
  selectedRoundId: string | null;
  onRoundChange: (roundId: string | null) => void;
}

const EditionRoundContext = createContext<EditionRoundContextType | undefined>(
  undefined
);

interface EditionRoundProviderProps {
  children: ReactNode;
}

const editionRounds: EditionRound[] = [
  { id: "5", name: "Round 5" },
  { id: "6", name: "Round 6" },
];

export function EditionRoundProvider({ children }: EditionRoundProviderProps) {
  const { filters, updateFilter } = useSearchParamsFilters();

  const onRoundChange = (value: string | null) => {
    if (!value) {
      updateFilter("editionId", undefined, { navigationMethod: "push" });
    } else {
      const selected = editionRounds.find((round) => round.id === value);
      if (selected) {
        updateFilter("editionId", selected.id, { navigationMethod: "push" });
      }
    }
  };

  return (
    <EditionRoundContext.Provider
      value={{
        editionRounds,
        selectedRoundId: filters.editionId || null,
        onRoundChange,
      }}
    >
      {children}
    </EditionRoundContext.Provider>
  );
}

export function useEditionRound(): EditionRoundContextType {
  const context = useContext(EditionRoundContext);
  if (!context) {
    throw new Error(
      "useEditionRound must be used inside an EditionRoundProvider"
    );
  }
  return context;
}
