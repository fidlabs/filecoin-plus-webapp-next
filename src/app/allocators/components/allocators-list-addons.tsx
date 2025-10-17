"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type Week } from "@/lib/weeks";
import { XIcon } from "lucide-react";
import {
  type ChangeEventHandler,
  type HTMLAttributes,
  useCallback,
  useState,
} from "react";
import { useDebounceCallback } from "usehooks-ts";
import { AllocatorsCSVExportButton } from "./allocators-csv-export-button";

type BaseProps = Omit<HTMLAttributes<HTMLDivElement>, "children">;
export interface AllocatorsListAddonsProps extends BaseProps {
  complianceWeek?: Week;
  onSearch(searchPhrase: string): void;
}

export function AllocatorsListAddons({
  className,
  complianceWeek,
  onSearch,
  ...rest
}: AllocatorsListAddonsProps) {
  const [searchPhrase, setSearchPhrase] = useState("");
  const searchDebounced = useDebounceCallback(onSearch, 150);

  const handleSearchPhraseChange = useCallback<
    ChangeEventHandler<HTMLInputElement>
  >(
    (event) => {
      const nextSearchPhrase = event.target.value;
      setSearchPhrase(nextSearchPhrase);
      searchDebounced(nextSearchPhrase);
    },
    [searchDebounced]
  );

  const handleClearSearch = useCallback(() => {
    setSearchPhrase("");
    searchDebounced("");
  }, [searchDebounced]);

  return (
    <div {...rest} className={cn("flex flex-wrap gap-4", className)}>
      <div className="relative w-[270px] ">
        <Input
          className="bg-background w-full text-[18px] lg:text-base"
          placeholder="Search by ID / Address / Name"
          value={searchPhrase}
          onChange={handleSearchPhraseChange}
        />
        {searchPhrase.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0"
            onClick={handleClearSearch}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AllocatorsCSVExportButton complianceWeek={complianceWeek} />
    </div>
  );
}
