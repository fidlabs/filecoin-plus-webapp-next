"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useCallback, useState } from "react";

export interface WeekSelectorProps {
  selectedOption: string;
  onOptionSelect(option: string): void;
}

const options = ["compliant", "nonCompliant", "partiallyCompliant"] as const;
const optionsDict: Record<string, string> = {
  compliant: "Compliant",
  nonCompliant: "Non Compliant",
  partiallyCompliant: "Partially Compliant",
};

export function ComplianceScoreSelector({
  selectedOption,
  onOptionSelect,
}: WeekSelectorProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleOptionsSelect = useCallback(
    (option: string) => {
      onOptionSelect(option);
      setPopoverOpen(false);
    },
    [onOptionSelect]
  );

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          className="gap-1"
          variant="outline"
          role="combobox"
          aria-expanded={popoverOpen}
        >
          {selectedOption ? (
            optionsDict[selectedOption]
          ) : (
            <em>All complaince scores</em>
          )}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command>
          <CommandList>
            {options.map((option) => (
              <CommandItem
                className="cursor-pointer"
                key={option}
                value={option}
                onSelect={handleOptionsSelect}
              >
                {optionsDict[option]}
                <CheckIcon
                  className={cn(
                    "ml-auto",
                    selectedOption === option ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
