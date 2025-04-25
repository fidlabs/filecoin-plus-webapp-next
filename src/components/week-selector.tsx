"use client";

import { useCallback, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import {
  type Week,
  weekFromString,
  weekToReadableString,
  weekToString,
} from "@/lib/weeks";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandItem, CommandList } from "@/components/ui/command";

export interface WeekSelectorProps {
  selectedWeek: Week;
  weeks: Week[];
  onWeekSelect(week: Week): void;
}

export function WeekSelector({
  selectedWeek,
  weeks,
  onWeekSelect,
}: WeekSelectorProps) {
  const [weekSelectOpen, setWeekSelectOpen] = useState(false);
  const selectedWeekString = weekToString(selectedWeek);

  const handleWeekSelect = useCallback(
    (weekString: string) => {
      onWeekSelect(weekFromString(weekString));
      setWeekSelectOpen(false);
    },
    [onWeekSelect]
  );

  return (
    <Popover open={weekSelectOpen} onOpenChange={setWeekSelectOpen}>
      <PopoverTrigger asChild>
        <Button
          className="gap-1"
          variant="outline"
          role="combobox"
          aria-expanded={weekSelectOpen}
        >
          {weekToReadableString(selectedWeek)}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command>
          <CommandList>
            {weeks.map((week) => {
              const weekString = weekToString(week);

              return (
                <CommandItem
                  className="cursor-pointer"
                  key={weekString}
                  value={weekString}
                  onSelect={handleWeekSelect}
                >
                  {weekToReadableString(week)}
                  <CheckIcon
                    className={cn(
                      "ml-auto",
                      selectedWeekString === weekString
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
