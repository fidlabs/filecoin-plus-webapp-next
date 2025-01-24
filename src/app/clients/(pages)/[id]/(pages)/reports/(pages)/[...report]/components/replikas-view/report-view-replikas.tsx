"use client"
import {
  useReportsDetails
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {
  ReportViewReplicaChart
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/replikas-view/report-view-replika-chart";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {InfoIcon} from "lucide-react";
import {
  ReportViewReplicaTable
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/replikas-view/report-view-replika-table";
import {HealthCheck} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/health-check";



const ReportViewReplicas = () => {
  const {
    colsStyle,
    colsSpanStyle,
    replikasList,
    securityChecks
  } = useReportsDetails()

  return <div className="grid" style={colsStyle}>
    <div className="p-4 border-b" style={colsSpanStyle}>
      <div className="flex gap-2 items-center">
        <h2 className="font-semibold text-lg">Deal Data Replication</h2>
        <HoverCard>
          <HoverCardTrigger asChild>
            <InfoIcon size={20} className="text-muted-foreground cursor-help"/>
          </HoverCardTrigger>
          <HoverCardContent className="w-full mx-6">
            <p>For most of the datacap application, below restrictions should apply.</p>
            <ul className="list-disc">
              <li className="ml-4">No more than 25% of unique data are stored with less than 4 providers</li>
            </ul>
          </HoverCardContent>
        </HoverCard>
      </div>
      <p className="pt-2">The below table shows how each many unique data are replicated across storage providers.</p>
    </div>
    {
      replikasList.map((replika, index) => {
        return <div key={index} className="border-b [&:not(:last-child)]:border-r-2">
          {securityChecks[index] && <HealthCheck security={securityChecks[index]?.filter(item => item.check.startsWith("DEAL_DATA_REPLICATION"))}/>}
          <ReportViewReplicaTable replikaData={replika}/>
          <ReportViewReplicaChart replikaData={replika}/>
        </div>
      })
    }
  </div>
}

export {ReportViewReplicas}