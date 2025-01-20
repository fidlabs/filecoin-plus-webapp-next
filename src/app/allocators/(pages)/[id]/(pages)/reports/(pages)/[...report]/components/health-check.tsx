"use client"
import {
  IClientReportCheckResult,
} from "@/lib/interfaces/cdp/cdp.interface";
import {useMemo} from "react";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {Badge} from "@/components/ui/badge";
import {ShieldCheckIcon, ShieldXIcon} from "lucide-react";
import {cn} from "@/lib/utils";

interface IReportViewProviderHealthProps {
  security: IClientReportCheckResult[]
}

const HealthCheck = ({security}: IReportViewProviderHealthProps) => {

  const healthCheck = useMemo(() => {
    return security.filter(item => !item.result).length
  }, [security])

  return <div className="p-4">
    <HoverCard>
      <HoverCardTrigger>
        <div className="flex gap-2 items-center cursor-help">
          Status:
          <Badge variant={!!healthCheck ? 'destructive' : 'secondary'}>
            {!!healthCheck ? `${healthCheck} issue${healthCheck > 1 ? 's' : ''}` : 'Healthy'}
          </Badge>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-full flex flex-col gap-1 items-start justify-start">
        {
          security.map((item, index) => {
            return <div key={index} className={cn(
              "flex gap-1 items-center justify-center whitespace-nowrap",
              !item.result && "text-destructive"
            )}>
              {item.result ? <ShieldCheckIcon/> : <ShieldXIcon/>}{item.metadata.msg}
            </div>
          })
        }
      </HoverCardContent>
    </HoverCard>
  </div>
}

export {HealthCheck}