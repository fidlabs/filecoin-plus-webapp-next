"use client";

import {
  ComplianceMetricsSelector,
  ComplianceMetricsSelectorProps,
} from "@/components/compliance-metrics-selector";
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

  const metricsConfig = useMemo<
    ComplianceMetricsSelectorProps["metricsConfig"]
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

  const handleMetricsConfigChange = useCallback<
    ComplianceMetricsSelectorProps["onConfigChange"]
  >(
    (metricsConfig) => {
      updateFilters({
        ...mapObject(metricsConfig, String),
        page: "1",
      });
    },
    [updateFilters]
  );

  return (
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

      <ComplianceMetricsSelector
        metricsConfig={metricsConfig}
        onConfigChange={handleMetricsConfigChange}
      />
    </div>
  );
}
