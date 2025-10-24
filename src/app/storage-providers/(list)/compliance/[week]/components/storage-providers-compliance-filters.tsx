"use client";

import {
  StorageProvidersComplianceMetricsSelector,
  StorageProvidersComplianceMetricsSelectorProps,
} from "@/app/storage-providers/components/storage-providers-compliance-metrics-selector";
import { StorageProvidersListAddons } from "@/app/storage-providers/components/storage-providers-list-addons";
import { ComplianceScoreSelector } from "@/components/compliance-score-selector";
import { WeekSelector } from "@/components/week-selector";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { mapObject, objectToURLSearchParams } from "@/lib/utils";
import { type Week, weekToString } from "@/lib/weeks";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface StorageProvidersComplianceFiltersProps {
  selectedWeek: Week;
  weeks: Week[];
}

export function StorageProvidersComplianceFilters({
  selectedWeek,
  weeks,
}: StorageProvidersComplianceFiltersProps) {
  const { push } = useRouter();
  const { filters, updateFilters } = useSearchParamsFilters();

  const metrics = useMemo<
    StorageProvidersComplianceMetricsSelectorProps["metrics"]
  >(() => {
    return {
      retrievability: filters.retrievability !== "false",
      numberOfClients: filters.numberOfClients !== "false",
      totalDealSize: filters.totalDealSize !== "false",
    };
  }, [filters]);

  const handleWeekChange = useCallback(
    (week: Week) => {
      push(
        `/storage-providers/compliance/${weekToString(week)}?${objectToURLSearchParams(
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

  const handleMetricsChange = useCallback<
    NonNullable<
      StorageProvidersComplianceMetricsSelectorProps["onMetricsChange"]
    >
  >(
    (metrics) => {
      const newFilters = {
        ...mapObject<boolean | undefined, string>(metrics, (value) => {
          return String(!!value);
        }),
        page: "1",
      };

      updateFilters(newFilters);
    },
    [updateFilters]
  );

  const handleSearch = useCallback(
    (searchPhrase: string) => {
      updateFilters({ provider: searchPhrase });
    },
    [updateFilters]
  );

  return (
    <div className="px-4 pb-4 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
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
        </div>

        <StorageProvidersListAddons onSearch={handleSearch} />
      </div>

      <StorageProvidersComplianceMetricsSelector
        includeDisabledMetricsOnChange
        metrics={metrics}
        onMetricsChange={handleMetricsChange}
      />
    </div>
  );
}
