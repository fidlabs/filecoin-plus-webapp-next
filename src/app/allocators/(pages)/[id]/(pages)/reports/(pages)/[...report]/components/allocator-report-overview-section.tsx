"use client";

import { CopyButton } from "@/components/copy-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import {
  AllocatorReportCheckType,
  type ICDPAllocatorFullReport,
} from "@/lib/interfaces/cdp/cdp.interface";
import { cn } from "@/lib/utils";
import { AlertCircleIcon } from "lucide-react";
import { type ReactNode } from "react";

interface OverviewItem {
  label: ReactNode;
  value: ReactNode;
  copyOptions?: {
    copyText: string;
    tooltipText: ReactNode;
    successText: string;
  };
  warningText?: ReactNode;
}

export interface AllocatorReportOverviewSectionProps {
  reports: ICDPAllocatorFullReport[];
}

const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

export function AllocatorReportOverviewSection({
  reports,
}: AllocatorReportOverviewSectionProps) {
  const { top, ref } = useScrollObserver();

  return (
    <div>
      <div
        ref={ref}
        className={cn(
          "p-4 border-b sticky top-[147px] bg-white",
          top > 90 && "z-[5]",
          top === 147 && "shadow-md"
        )}
      >
        <h2 className="font-semibold text-lg">Allocator Overview</h2>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${reports.length}, minmax(0, 1fr))`,
        }}
      >
        {reports.map((report, index) => {
          const overviewItems: OverviewItem[] = [
            {
              label: "Chain Address",
              value: `${report.address.slice(0, 4)}...${report.address.slice(-4)}`,
              copyOptions: {
                copyText: report.address,
                successText: "Address copied",
                tooltipText: "Copy Address",
              },
            },
            {
              label: "Number of Clients",
              value: report.clients_number,
            },
            {
              label: "Is Multisig",
              value: report.multisig ? "Yes" : "No",
            },
            {
              label: "Average RPA",
              value:
                typeof report.avg_retrievability_success_rate_url_finder ===
                "number"
                  ? percentageFormatter.format(
                      report.avg_retrievability_success_rate_url_finder
                    )
                  : "N/A",
            },
            {
              label: "Required Copies",
              value: report.required_copies,
              warningText: report.check_results.find((checkResult) => {
                return (
                  checkResult.check ===
                    AllocatorReportCheckType.CLIENT_NOT_ENOUGH_COPIES &&
                  !checkResult.result
                );
              })?.metadata.msg,
            },
            {
              label: "Average Time To First Deal",
              value:
                report.avg_secs_to_first_deal &&
                report.avg_secs_to_first_deal > 0
                  ? `${(report.avg_secs_to_first_deal / 86400).toFixed(2)} ${
                      report.avg_secs_to_first_deal / 86400 < 2 ? "day" : "days"
                    }` // Convert seconds to days
                  : "N/A",
            },
          ];

          return (
            <div
              key={index}
              className="p-4 border-b [&:not(:last-child)]:border-r-2 flex flex-wrap items-center gap-2"
            >
              {overviewItems.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h5 className="text-sm mb-1">{item.label}</h5>
                  <div className="flex items-center space-x-2 h-10">
                    <p className="text-lg font-semibold">{item.value}</p>

                    {!!item.copyOptions && (
                      <CopyButton
                        copyText={item.copyOptions.copyText}
                        successText={item.copyOptions.successText}
                        tooltipText={item.copyOptions.tooltipText}
                      />
                    )}

                    {!!item.warningText && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircleIcon className="h-5 w-5 text-orange-500 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>{item.warningText}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
