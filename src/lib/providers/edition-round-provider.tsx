"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

export interface EditionRound {
  id: string;
  name: string;
}

interface EditionRoundContextType {
  editionRounds: EditionRound[];
  lastEditionRound: EditionRound;
  selectedRound: EditionRound;
  setRound: (round: EditionRound) => void;
}

const EditionRoundContext = createContext<EditionRoundContextType | undefined>(
  undefined
);

interface EditionRoundProviderProps {
  children: ReactNode;
}

export const EditionRoundProvider: React.FC<EditionRoundProviderProps> = ({
  children,
}) => {
  const editionRounds: EditionRound[] = [
    { id: "5", name: "Round 5" },
    { id: "6", name: "Round 6" },
  ];

  const lastEditionRound = editionRounds[editionRounds.length - 1];
  const [round, setRound] = useState<EditionRound>(lastEditionRound);

  return (
    <EditionRoundContext.Provider
      value={{
        editionRounds,
        lastEditionRound,
        selectedRound: round,
        setRound,
      }}
    >
      {children}
    </EditionRoundContext.Provider>
  );
};

export const useEditionRound = (): EditionRoundContextType => {
  const context = useContext(EditionRoundContext);
  if (!context) {
    throw new Error(
      "useEditionRound must be used inside an EditionRoundProvider"
    );
  }
  return context;
};
