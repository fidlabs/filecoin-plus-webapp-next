"use client"
import {
  IClientReportReplicaDistribution
} from "@/lib/interfaces/cdp/cdp.interface";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {Badge} from "@/components/ui/badge";
import {ShieldCheckIcon, ShieldXIcon} from "lucide-react";
import {useMemo} from "react";

interface IReportViewReplicaHealth {
  replikaData: IClientReportReplicaDistribution[]
}

const ReportViewReplicaHealth = ({replikaData}: IReportViewReplicaHealth) => {

  const healthCheck = useMemo(() => {
    return replikaData.filter(item => !item.not_found && +item.num_of_replicas < 4).reduce((acc, item) => acc + item.percentage, 0);
  }, [replikaData])

  return <div className="p-4">
    <HoverCard>
      <HoverCardTrigger>
        <div className="flex gap-2 items-center cursor-help">
          Status:
          <Badge variant={healthCheck > 25 ? 'destructive' : 'secondary'}>
            {healthCheck > 25 ? `Not healthy` : 'Healthy'}
          </Badge>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-full flex flex-col gap-1 items-start justify-start">
        <div className="flex gap-1 items-center justify-center whitespace-nowrap">{healthCheck > 20 ?
          <ShieldXIcon/> : <ShieldCheckIcon/>} No more than 25% of unique data are stored with less than 4 providers.
        </div>
        <div>
          Current: {healthCheck.toFixed(2)}%
        </div>
      </HoverCardContent>
    </HoverCard>
  </div>
}

export {ReportViewReplicaHealth}