"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { type IAllocator } from "@/lib/interfaces/dmob/allocator.interface";
import { cn, downloadCSV } from "@/lib/utils";
import { type Week, weekToUTCDate } from "@/lib/weeks";
import { DownloadIcon, LoaderCircleIcon } from "lucide-react";
import { type MouseEventHandler, useCallback, useState } from "react";
import { toast } from "sonner";
import {
  fetchAllocators,
  fetchAllocatorsByCompliance,
  type FetchAllocatorsByComplianceParameters,
  type FetchAllocatorsParameters,
} from "../allocators-data";
import { omit } from "lodash";

type BaseProps = Omit<ButtonProps, "children">;

interface PropsWithComplianceWeek {
  complianceWeek: Week;
  parameters: FetchAllocatorsByComplianceParameters;
}

interface PropsWithoutComplianceWeek {
  complianceWeek?: never;
  parameters: FetchAllocatorsParameters;
}

export type AllocatorsCSVExportButtonProps = BaseProps &
  (PropsWithComplianceWeek | PropsWithoutComplianceWeek);

const csvColumnsKeys: Array<keyof IAllocator> = [
  "addressId",
  "name",
  "orgName",
  "verifiedClientsCount",
  "allowance",
  "remainingDatacap",
  "initialAllowance",
  "createdAtHeight",
  "address",
  "removed",
];

const csvColumnsHeaders = [
  "Allocator ID",
  "Name",
  "Organization Name",
  "Verified Clients",
  "DataCap Available",
  "DataCap Remaining",
  "Total DataCap received",
  "Create date",
  "Address",
  "Allocator deprecated",
].join(",");

export function AllocatorsCSVExportButton({
  className,
  complianceWeek,
  disabled,
  parameters,
  onClick,
  ...rest
}: AllocatorsCSVExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      onClick?.(event);

      try {
        setLoading(true);
        const restOfParameters = omit(parameters, ["page", "limit"]);
        const request = complianceWeek
          ? fetchAllocatorsByCompliance({
              ...restOfParameters,
              week: weekToUTCDate(complianceWeek).toISOString(),
            })
          : fetchAllocators(restOfParameters);
        const response = await request;

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
        downloadCSV("allocators.csv", contents);
      } catch (error) {
        toast.error("Could not generate CSV file");
      } finally {
        setLoading(false);
      }
    },
    [complianceWeek, parameters, onClick]
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
