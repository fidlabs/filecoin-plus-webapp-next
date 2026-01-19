"use client";

import { FetchAllocatorsByComplianceParameters } from "@/app/allocators/allocators-data";
import {
  AllocatorsListAddons,
  AllocatorsListAddonsProps,
} from "@/app/allocators/components/allocators-list-addons";
import {
  AllocatorsSPsComplianceMetricsSelector,
  AllocatorsSPsComplianceMetricsSelectorProps,
} from "@/app/allocators/components/allocators-sps-compliance-metrics-selector";
import { AllocatorsComplianceThresholdSelector } from "@/components/allocators-compliance-threshold-selector";
import { ComplianceScoreSelector } from "@/components/compliance-score-selector";
import { WeekSelector } from "@/components/week-selector";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { mapObject, objectToURLSearchParams } from "@/lib/utils";
import {
  type Week,
  weekFromDate,
  weekFromString,
  weekToString,
} from "@/lib/weeks";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useDebounceCallback } from "usehooks-ts";

export interface AllocatorsComplianceFiltersProps {
  selectedWeek: Week;
  weeks: Week[];
}

function safeStringToInt(
  input: string | undefined,
  defaultValue: number
): number {
  if (typeof input !== "string") {
    return defaultValue;
  }

  const numericValue = parseInt(input, 10);
  return isNaN(numericValue) ? defaultValue : numericValue;
}

function searchParamsToFetchParams(
  searchParams: Record<string, string | undefined>
): FetchAllocatorsByComplianceParameters {
  return {
    page: safeStringToInt(searchParams.page, 1),
    limit: safeStringToInt(searchParams.limit, 1),
    sort: searchParams.sort,
    order:
      searchParams.order === "asc" || searchParams.order === "desc"
        ? searchParams.order
        : undefined,
    filter: searchParams.filter,
    complianceThresholdPercentage: safeStringToInt(
      searchParams.complianceThresholdPercentage,
      50
    ),
    httpRetrievability: false,
    urlFinderRetrievability: searchParams.urlFinderRetrievability !== "false",
    numberOfClients: searchParams.numberOfClients !== "false",
    totalDealSize: searchParams.totalDealSize !== "false",
  };
}

export function AllocatorsComplianceFilters({
  selectedWeek,
  weeks,
}: AllocatorsComplianceFiltersProps) {
  const { push } = useRouter();
  const { filters, updateFilters } = useSearchParamsFilters();

  const metrics = useMemo<
    AllocatorsSPsComplianceMetricsSelectorProps["metrics"]
  >(() => {
    return {
      httpRetrievability: filters.httpRetrievability !== "false",
      urlFinderRetrievability: filters.urlFinderRetrievability !== "false",
      numberOfClients: filters.numberOfClients !== "false",
      totalDealSize: filters.totalDealSize !== "false",
    };
  }, [filters]);

  const handleWeekChange = useCallback(
    (week: Week) => {
      push(
        `/allocators/compliance/${weekToString(week)}?${objectToURLSearchParams(
          {
            ...filters,
            page: "1",
          }
        ).toString()}`
      );
    },
    [filters, push]
  );

  const handleComplianceScoreChange = useCallback(
    (option: string | undefined) => {
      updateFilters({
        complianceScore: option,
        page: "1",
      });
    },
    [updateFilters]
  );

  const handleThresholdChange = useCallback(
    (value: number) => {
      updateFilters({
        complianceThresholdPercentage: String(value),
        page: "1",
      });
    },
    [updateFilters]
  );

  const handleThresholdChangeDebounced = useDebounceCallback(
    handleThresholdChange,
    150
  );

  const handleMetricsChange = useCallback<
    AllocatorsSPsComplianceMetricsSelectorProps["onMetricsChange"]
  >(
    (metrics) => {
      updateFilters({
        ...mapObject<boolean | void, string>(metrics, (value) => {
          return typeof value !== "undefined" ? String(value) : "true";
        }),
        page: "1",
      });
    },
    [updateFilters]
  );

  const handleSearch = useCallback<AllocatorsListAddonsProps["onSearch"]>(
    (searchPhrase) => {
      updateFilters({
        filter: searchPhrase,
        page: "1",
      });
    },
    [updateFilters]
  );

  const handleSearchDebounced = useDebounceCallback(handleSearch, 150);

  return (
    <div className="mb-8">
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          {weeks.length > 0 && (
            <WeekSelector
              selectedWeek={selectedWeek}
              weeks={weeks}
              onWeekSelect={handleWeekChange}
            />
          )}

          <ComplianceScoreSelector
            selectedOption={filters.complianceScore}
            onOptionSelect={handleComplianceScoreChange}
          />

          <AllocatorsComplianceThresholdSelector
            initialValue={
              filters.complianceThresholdPercentage
                ? parseInt(filters.complianceThresholdPercentage)
                : 50
            }
            onThresholdChange={handleThresholdChangeDebounced}
          />
        </div>

        <AllocatorsListAddons
          complianceWeek={
            filters.week
              ? weekFromString(filters.week)
              : weekFromDate(new Date())
          }
          parameters={searchParamsToFetchParams(filters)}
          onSearch={handleSearchDebounced}
        />
      </div>

      <AllocatorsSPsComplianceMetricsSelector
        metrics={metrics}
        onMetricsChange={handleMetricsChange}
        includeDisabledMetricsOnChange
      />
    </div>
  );
}
