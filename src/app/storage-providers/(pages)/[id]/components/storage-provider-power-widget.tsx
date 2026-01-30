"use client";

import { fetchStorageProviderFilscanInfo } from "@/app/storage-providers/storage-providers-data";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { QueryKey } from "@/lib/constants";
import { filBalanceToDecimal, formatFilBalance } from "@/lib/utils";
import { filesize } from "filesize";
import { type HTMLAttributes, useMemo } from "react";
import useSWR from "swr";

type BaseProps = Omit<HTMLAttributes<HTMLDivElement>, "children">;
export interface StorageProviderPowerWidgetProps extends BaseProps {
  storageProviderId: string;
}

interface Param {
  label: string;
  value: string | null;
}

interface SectorStatus {
  label: string;
  value: number;
  color: string;
}

const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 4,
});

const sectorNumberFormatter = new Intl.NumberFormat("en-US");

export function StorageProviderPowerWidget({
  storageProviderId,
  ...rest
}: StorageProviderPowerWidgetProps) {
  const { data } = useSWR(
    [QueryKey.STORAGE_PROVIDER_FILSCAN_INFO, storageProviderId],
    ([, storageProviderId]) => {
      return fetchStorageProviderFilscanInfo({ storageProviderId });
    },
    { keepPreviousData: true }
  );

  const paramsGroups = useMemo<Param[][]>(() => {
    return [
      [
        {
          label: "Power Rate",
          value: data
            ? percentageFormatter.format(
                parseFloat(data.quality_power_percentage)
              )
            : null,
        },
        {
          label: "Raw Byte Power",
          value: data ? filesize(data.raw_power, { standard: "iec" }) : null,
        },
        {
          label: "Sector Size",
          value: data ? filesize(data.sector_size, { standard: "iec" }) : null,
        },
      ],
      [
        {
          label: "30D Wincount",
          value: data ? data.total_win_count.toString() : null,
        },
        {
          label: "30D Reward",
          value: data
            ? formatFilBalance(filBalanceToDecimal(data.total_reward))
            : null,
        },
        {
          label: "30D Blocks",
          value: data ? data.total_block_count.toString() : null,
        },
      ],
    ];
  }, [data]);

  const sectorStatuses = useMemo<
    [SectorStatus, ...SectorStatus[]] | null
  >(() => {
    if (!data) {
      return null;
    }

    return [
      {
        label: "Total",
        value: data.sector_count,
        color: "#000",
      },
      {
        label: "Active",
        value: data.active_sector_count,
        color: "hsl(var(--color-dodger-blue))",
      },
      {
        label: "Faults",
        value: data.fault_sector_count,
        color: "#ff0029",
      },
      {
        label: "Recoveries",
        value: data.recover_sector_count,
        color: "orange",
      },
      {
        label: "Terminated",
        value: data.terminate_sector_count,
        color: "#aaa",
      },
    ];
  }, [data]);

  return (
    <Card {...rest}>
      <header className="flex justify-between p-4">
        <div>
          {data ? (
            <p className="text-lg font-medium">
              {filesize(data.quality_adjust_power, { standard: "iec" })}
            </p>
          ) : (
            <Skeleton className="w-[100px] h-7" />
          )}

          <h3 className="text-xs text-muted-foreground">
            Quality Adjusted Power
          </h3>
        </div>

        <div className="text-right">
          {data ? (
            <p className="text-lg font-medium">{data.quality_power_rank}</p>
          ) : (
            <Skeleton className="w-[100px] h-7" />
          )}

          <h3 className="text-xs text-muted-foreground">Ranking</h3>
        </div>
      </header>

      <div className="flex flex-wrap">
        {paramsGroups.map((paramsGroup, index) => (
          <div
            key={`params_group_${index}`}
            className="flex flex-1 min-w-[300px] border-t border-b border-r last:border-r-0"
          >
            <table className="w-full text-sm">
              <TableBody>
                {paramsGroup.map(({ label, value }, index) => (
                  <TableRow key={`row_${index}`}>
                    <TableCell>{label}</TableCell>
                    <TableCell className="font-medium">
                      {value === null ? (
                        <Skeleton className="w-[50px] h-4" />
                      ) : (
                        value
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>
        ))}
      </div>

      <div className="p-4">
        <h4 className="text-sm font-medium mb-2">Sector Status</h4>

        <div className="w-full h-6 mb-2 bg-gray-100 rounded-sm flex overflow-hidden">
          {sectorStatuses ? (
            sectorStatuses.slice(1).map((sectorStatus) => {
              const widthPercentage = Math.max(
                (sectorStatus.value / sectorStatuses[0].value) * 100,
                sectorStatus.value === 0 ? 0 : 1
              );

              return (
                <div
                  key={`sector_status_bar_${sectorStatus.label}`}
                  style={{
                    backgroundColor: sectorStatus.color,
                    width: `${widthPercentage}%`,
                  }}
                />
              );
            })
          ) : (
            <Skeleton className="w-full h-full" />
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          {sectorStatuses ? (
            sectorStatuses.map((sectorStatus) => (
              <p
                key={`sector_status_${sectorStatus.label}`}
                className="font-medium text-sm text-muted-foreground"
              >
                <span style={{ color: sectorStatus.color }}>
                  {sectorNumberFormatter.format(sectorStatus.value)}
                </span>{" "}
                {sectorStatus.label}
              </p>
            ))
          ) : (
            <Skeleton className="w-[200px] h-4" />
          )}
        </div>
      </div>
    </Card>
  );
}
