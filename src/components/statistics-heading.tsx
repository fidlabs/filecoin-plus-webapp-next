"use select";

import { HTMLAttributes, useCallback, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ArrayElement, cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "./ui/command";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

type Interval = ArrayElement<typeof intervals>;
type BaseProps = Omit<HTMLAttributes<HTMLDivElement>, "children">;
export interface StatisticsHeadingProps extends BaseProps {
  selectedInterval: Interval;
  onIntervalChange(interval: Interval): void;
}

const intervals = ["day", "week", "month"] as const;

function getLabelForInterval(interval: Interval): string {
  switch (interval) {
    case "day":
      return "Daily";
    case "week":
      return "Weekly";
    case "month":
      return "Monthly";
  }
}

export function StatisticsHeading({
  className,
  selectedInterval,
  onIntervalChange,
  ...rest
}: StatisticsHeadingProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleComboboxSelect = useCallback(
    (value: string) => {
      onIntervalChange(value as Interval);
      setPopoverOpen(false);
    },
    [onIntervalChange]
  );

  return (
    <header
      {...rest}
      className={cn("lg:flex lg:justify-between lg:items-center", className)}
    >
      <h3 className="text-xl">Statistics</h3>
      <div className="text-sm">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              className="text-sm text-inherit p-0 underline font-semibold"
              variant="ghost"
              role="combobox"
              aria-expanded={popoverOpen}
            >
              {getLabelForInterval(selectedInterval)}
              <ChevronDownIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="p-0" side="bottom" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {intervals.map((interval) => (
                    <CommandItem
                      key={interval}
                      value={interval}
                      className="text-sm cursor-pointer"
                      onSelect={handleComboboxSelect}
                    >
                      {getLabelForInterval(interval)}
                      <CheckIcon
                        className={cn(
                          "ml-auto",
                          interval === selectedInterval
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
        <span> change</span>
      </div>
    </header>
  );
}
