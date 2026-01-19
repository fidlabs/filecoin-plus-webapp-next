"use client";

import { HealthCheck } from "@/components/health-check";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import {
  ClientReportCheckType,
  IClientFullReport,
} from "@/lib/interfaces/cdp/cdp.interface";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import { ReportViewReplicaTable } from "./report-view-replica-table";
import { ReportViewReplicaChart } from "./report-view-replica-chart";

export interface ReportViewReplicasProps {
  comparsionEnabled: boolean;
  reports: IClientFullReport[];
}

const checkTypes = [
  ClientReportCheckType.DEAL_DATA_REPLICATION_CID_SHARING,
  ClientReportCheckType.DEAL_DATA_REPLICATION_LOW_REPLICA,
  ClientReportCheckType.NOT_ENOUGH_COPIES,
  ClientReportCheckType.UNIQ_DATA_SET_SIZE_TO_DECLARED,
  ClientReportCheckType.DEAL_DATA_REPLICATION_HIGH_REPLICA,
];

export function ReportViewReplicas({
  comparsionEnabled,
  reports,
}: ReportViewReplicasProps) {
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
        <div className="flex gap-2 items-center">
          <h2 className="font-semibold text-lg">Deal Data Replication</h2>
          <HoverCard>
            <HoverCardTrigger asChild>
              <InfoIcon
                size={20}
                className="text-muted-foreground cursor-help"
              />
            </HoverCardTrigger>
            <HoverCardContent className="w-full mx-6">
              <p>
                For most of the datacap application, below restrictions should
                apply.
              </p>
              <ul className="list-disc">
                <li className="ml-4">
                  No more than 25% of unique data are stored with less than 4
                  providers
                </li>
              </ul>
            </HoverCardContent>
          </HoverCard>
        </div>
        <p className="pt-2">
          The below table shows how each many unique data are replicated across
          storage providers.
        </p>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${reports.length}, minmax(0, 1fr))`,
        }}
      >
        {reports.map((report, index) => {
          return (
            <div
              key={index}
              className="border-b [&:not(:last-child)]:border-r-2"
            >
              <HealthCheck
                security={report.check_results.filter((item) => {
                  return checkTypes.includes(item.check);
                })}
              />
              <ReportViewReplicaTable
                report={report}
                reportToCompare={
                  comparsionEnabled ? reports[index - 1] : undefined
                }
              />
              <ReportViewReplicaChart
                replikaData={report.replica_distribution}
                lowReplicaThreshold={report.low_replica_threshold}
                highReplicaThreshold={report.high_replica_threshold}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
