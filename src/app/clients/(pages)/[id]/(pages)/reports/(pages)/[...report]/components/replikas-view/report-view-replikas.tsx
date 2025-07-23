"use client";

import { ReportViewReplicaChart } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/replikas-view/report-view-replika-chart";
import { ReportViewReplicaTable } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/replikas-view/report-view-replika-table";
import { useReportsDetails } from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import { HealthCheck } from "@/components/health-check";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useScrollObserver } from "@/lib/hooks/useScrollObserver";
import { ClientReportCheckType } from "@/lib/interfaces/cdp/cdp.interface";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";

const checkTypes = [
  ClientReportCheckType.DEAL_DATA_REPLICATION_CID_SHARING,
  ClientReportCheckType.DEAL_DATA_REPLICATION_LOW_REPLICA,
  ClientReportCheckType.NOT_ENOUGH_COPIES,
  ClientReportCheckType.UNIQ_DATA_SET_SIZE_TO_DECLARED,
];

export function ReportViewReplicas() {
  const { colsStyle, colsSpanStyle, replikasList, securityChecks } =
    useReportsDetails();

  const { top, ref } = useScrollObserver();

  return (
    <div className="grid" style={colsStyle}>
      <div
        ref={ref}
        className={cn(
          "p-4 border-b sticky top-[147px] bg-white",
          top > 90 && "z-[5]",
          top === 147 && "shadow-md"
        )}
        style={colsSpanStyle}
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
      {replikasList.map((replika, index) => {
        return (
          <div key={index} className="border-b [&:not(:last-child)]:border-r-2">
            {!!securityChecks[index] && (
              <HealthCheck
                security={securityChecks[index].filter((item) => {
                  return checkTypes.includes(item.check);
                })}
              />
            )}
            <ReportViewReplicaTable replikaData={replika} />
            <ReportViewReplicaChart replikaData={replika} />
          </div>
        );
      })}
    </div>
  );
}
