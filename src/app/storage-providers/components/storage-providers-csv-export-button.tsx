"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import {
  getStorageProviders,
  getStorageProvidersByCompliance,
} from "@/lib/api";
import { useSearchParamsFilters } from "@/lib/hooks/use-search-params-filters";
import { IStorageProvider } from "@/lib/interfaces/dmob/sp.interface";
import { cn, downloadCSV } from "@/lib/utils";
import { Week, weekToUTCDate } from "@/lib/weeks";
import { DownloadIcon, LoaderCircleIcon } from "lucide-react";
import { MouseEventHandler, useCallback, useState } from "react";
import { toast } from "sonner";

type BaseProps = Omit<ButtonProps, "children">;
export interface StorageProvidersCSVExportButtonProps extends BaseProps {
  complianceWeek?: Week;
}

const csvColumnsKeys: Array<keyof IStorageProvider> = [
  "provider",
  "noOfVerifiedDeals",
  "noOfClients",
  "verifiedDealsTotalSize",
  "lastDealHeight",
];
const csvColumnsHeaders = [
  "Storage Provider ID",
  "Deals",
  "Number of Clients",
  "Total Deals Size",
  "Last Deal",
];

const defaultFilters = {
  page: "1",
  limit: "999999",
};

function fetchData(filters: Record<string, string>, complianceWeek?: Week) {
  const mergedFilters = {
    ...filters,
    ...defaultFilters,
    week: complianceWeek
      ? weekToUTCDate(complianceWeek).toISOString()
      : undefined,
  };

  if (!complianceWeek) {
    return getStorageProviders(mergedFilters);
  }

  return getStorageProvidersByCompliance(mergedFilters);
}

export function StorageProvidersCSVExportButton({
  className,
  complianceWeek,
  disabled,
  onClick,
  ...rest
}: StorageProvidersCSVExportButtonProps) {
  const { filters } = useSearchParamsFilters();
  const [loading, setLoading] = useState(false);
  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      onClick?.(event);

      try {
        setLoading(true);
        const response = await fetchData(filters, complianceWeek);

        const dataString = response.data
          .map((entry) => {
            return csvColumnsKeys
              .map((key) => {
                const value = entry[key];
                if (!!value) {
                  return JSON.stringify(value)
                    .replace(/,/g, " ")
                    .replace(/;/g, " ");
                }
                return "";
              })
              .join(",");
          })
          .join("\r\n");

        const contents = `${csvColumnsHeaders}\r\n${dataString}`;
        downloadCSV("storage-providers.csv", contents);
      } catch (error) {
        toast.error("Could not generate CSV file");
      } finally {
        setLoading(false);
      }
    },
    [complianceWeek, filters, onClick]
  );

  return (
    <Button
      variant="outline"
      {...rest}
      className={cn("gap-2", className)}
      disabled={disabled || loading}
      onClick={handleClick}
    >
      Export to CSV{" "}
      {loading ? (
        <LoaderCircleIcon className="h-4 w-4 animate-spin" />
      ) : (
        <DownloadIcon className="h-4 w-4" />
      )}
    </Button>
  );
}
