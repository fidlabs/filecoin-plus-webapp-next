"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { type Week } from "@/lib/weeks";
import { XIcon } from "lucide-react";
import {
  type ChangeEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDebounceCallback } from "usehooks-ts";
import { StorageProvidersCSVExportButton } from "./storage-providers-csv-export-button";

export interface StorageProvidersListAddonsProps {
  complianceWeek?: Week;
}

export function StorageProvidersListAddons({
  complianceWeek,
}: StorageProvidersListAddonsProps) {
  const { updateFilters } = useSearchParamsFilters();
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
  >((event) => {
    setSearchPhrase(event.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchPhrase("");
  }, []);

  useEffect(() => {
    searchDebounced(searchPhrase);
  }, [searchPhrase, searchDebounced]);

  return (
    <div className="flex flex-wrap gap-4">
      <div className="relative w-full md:max-w-[200px] ">
        <Input
          className="bg-background w-full text-[18px] lg:text-base"
          value={searchPhrase}
          placeholder="Search by ID..."
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

      <StorageProvidersCSVExportButton complianceWeek={complianceWeek} />
    </div>
  );
}
