"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { cn } from "@/lib/utils";
import { type Week } from "@/lib/weeks";
import { XIcon } from "lucide-react";
import {
  type ChangeEventHandler,
  type ComponentProps,
  type HTMLAttributes,
  useCallback,
  useState,
} from "react";
import { useDebounceCallback } from "usehooks-ts";
import { AllocatorsCSVExportButton } from "./allocators-csv-export-button";

type CheckboxProps = ComponentProps<typeof Checkbox>;
type CheckedChangeHandler = NonNullable<CheckboxProps["onCheckedChange"]>;
type BaseProps = Omit<HTMLAttributes<HTMLDivElement>, "children">;
export interface AllocatorsListAddonsProps extends BaseProps {
  complianceWeek?: Week;
}

export function AllocatorsListAddons({
  className,
  complianceWeek,
  ...rest
}: AllocatorsListAddonsProps) {
  const { filters, updateFilters } = useSearchParamsFilters();
  const [searchPhrase, setSearchPhrase] = useState("");

  const search = useCallback(
    (searchPhrase: string) => {
      updateFilters({
        filter: searchPhrase,
        page: "1",
      });
    },
    [updateFilters]
  );

  const searchDebounced = useDebounceCallback(search, 150);

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

  const handleShowInactiveChange = useCallback<CheckedChangeHandler>(
    (state) => {
      updateFilters({
        showInactive: state === true ? "true" : "false",
        page: "1",
      });
    },
    [updateFilters]
  );

  return (
    <div {...rest} className={cn("flex flex-wrap gap-4", className)}>
      <div className="relative w-full md:max-w-[270px] ">
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

      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-inactive"
          checked={filters.showInactive === "true"}
          onCheckedChange={handleShowInactiveChange}
        />
        <label
          className="text-sm font-medium leading-none"
          htmlFor="show-inactive"
        >
          Show Inactive
        </label>
      </div>
    </div>
  );
}
