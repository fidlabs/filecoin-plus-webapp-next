"use client"
import {
  IClientReportStorageProviderDistribution
} from "@/lib/interfaces/cdp/cdp.interface";
import {useMemo} from "react";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {groupBy} from "lodash";
import {Badge} from "@/components/ui/badge";
import {ShieldCheckIcon, ShieldXIcon} from "lucide-react";

interface IReportViewProviderHealthProps {
  providerDistribution: IClientReportStorageProviderDistribution[]
}

const ReportViewProviderHealth = ({providerDistribution}: IReportViewProviderHealthProps) => {

  const stats = useMemo(() => {
    return {
      totalSizeOver25Percent: providerDistribution.filter(item => item.total_deal_percentage > 25).length,
      duplicatesOver20Percent: providerDistribution.filter(item => item.duplication_percentage > 20).length,
      privateIdAddress: providerDistribution.filter(item => !item.location.ip).length,
      missingRegions: providerDistribution.length - Object.keys(groupBy(providerDistribution.filter(item => !!item.location.region), item => item.location.region)).length,
    }
  }, [providerDistribution])

  const healthCheck = useMemo(() => {
    return Object.values(stats).reduce((acc, item) => {
      if (item > 0) {
        return acc + 1
      }
      return acc
    }, 0);
  }, [stats])

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
        <div className="flex gap-1 items-center justify-center whitespace-nowrap">{stats.totalSizeOver25Percent ? <ShieldXIcon/> : <ShieldCheckIcon/>}Storage provider should not exceed 25% of total datacap.</div>
        <div className="flex gap-1 items-center justify-center whitespace-nowrap">{stats.duplicatesOver20Percent ? <ShieldXIcon/> : <ShieldCheckIcon/>}Storage provider should not be storing duplicate data for more than 20%.</div>
        <div className="flex gap-1 items-center justify-center whitespace-nowrap">{stats.privateIdAddress ? <ShieldXIcon/> : <ShieldCheckIcon/>}Storage provider should have published its public IP address.</div>
        <div className="flex gap-1 items-center justify-center whitespace-nowrap">{stats.missingRegions ? <ShieldXIcon className="text-destructive"/> : <ShieldCheckIcon/>}All storage providers should be located in different regions.</div>
      </HoverCardContent>
    </HoverCard>
  </div>
}

export {ReportViewProviderHealth}