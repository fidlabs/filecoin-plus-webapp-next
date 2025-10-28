"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { useCallback, useState } from "react";

interface Check {
  check: string;
  checkName: string;
}

type CheckSelectHandler = (check: string) => void;

export interface AllocatorsChecksSelectProps {
  availableChecks: Check[];
  selectedChecks: string[];
  onSelectedChecksChange(selectedChecks: string[]): void;
}

export function AllocatorsChecksSelect({
  availableChecks,
  selectedChecks,
  onSelectedChecksChange,
}: AllocatorsChecksSelectProps) {
  const [open, setOpen] = useState(false);

  const selectAll = useCallback(() => {
    onSelectedChecksChange(availableChecks.map((check) => check.check));
  }, [availableChecks, onSelectedChecksChange]);

  const deselectAll = useCallback(() => {
    onSelectedChecksChange([]);
  }, [onSelectedChecksChange]);

  const handleCheckSelect = useCallback<CheckSelectHandler>(
    (check) => {
      const foundIndex = selectedChecks.findIndex(
        (candidate) => candidate === check
      );
      const nextSelectedChecks =
        foundIndex !== -1
          ? selectedChecks.toSpliced(foundIndex, 1)
          : [...selectedChecks, check];
      onSelectedChecksChange(nextSelectedChecks);
    },
    [onSelectedChecksChange, selectedChecks]
  );

  return (
    <div className="flex flex-wrap gap-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
            disabled={availableChecks.length === 0}
          >
            {selectedChecks.length > 0
              ? `${selectedChecks.length} metric${selectedChecks.length === 1 ? "" : "s"} selected`
              : "Select metrics..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search metrics..." className="h-9" />
            <CommandList>
              <CommandEmpty>No metrics match the search phrase.</CommandEmpty>
              <CommandGroup>
                {availableChecks.map((availableCheck) => (
                  <CommandItem
                    key={availableCheck.check}
                    value={availableCheck.check}
                    onSelect={handleCheckSelect}
                    className="text-xs cursor-pointer"
                  >
                    {availableCheck.checkName}
                    <CheckIcon
                      className={cn(
                        "ml-auto",
                        selectedChecks.includes(availableCheck.check)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button
        className="ml-2"
        variant="ghost"
        disabled={availableChecks.length === 0}
        onClick={selectAll}
      >
        Select All
      </Button>
      <Button
        variant="ghost"
        disabled={selectedChecks.length === 0}
        onClick={deselectAll}
      >
        Clear
      </Button>
    </div>
  );
}
