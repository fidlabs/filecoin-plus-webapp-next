"use client";

import { Button } from "@/components/ui/button";
import { useCallback } from "react";

export interface EnableCompareButtonProps {
  comparsionEnabled: boolean;
  onComparsionEnabledChange(nextState: boolean): void;
}

export function EnableCompareButton({
  comparsionEnabled,
  onComparsionEnabledChange,
}: EnableCompareButtonProps) {
  const handleClick = useCallback(() => {
    onComparsionEnabledChange(!comparsionEnabled);
  }, [comparsionEnabled, onComparsionEnabledChange]);

  return (
    <Button
      variant={comparsionEnabled ? "outline" : "default"}
      onClick={handleClick}
    >
      {comparsionEnabled ? "Disable compare" : "Enable compare"}
    </Button>
  );
}
