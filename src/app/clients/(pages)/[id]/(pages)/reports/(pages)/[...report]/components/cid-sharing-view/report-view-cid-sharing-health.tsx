"use client"
import {
  IClientReportCIDSharing,
} from "@/lib/interfaces/cdp/cdp.interface";
import {Badge} from "@/components/ui/badge";
import {useMemo} from "react";

interface IReportViewCidSharingHealth {
  cidSharingData: IClientReportCIDSharing[]
}

const ReportViewCidSharingHealth = ({cidSharingData}: IReportViewCidSharingHealth) => {

  const healthCheck = useMemo(() => {
    return cidSharingData.length > 0;
  }, [cidSharingData])

  return <div className="p-4">
    <div className="flex gap-2 items-center">
      Status:
      <Badge variant={healthCheck ? 'destructive' : 'secondary'}>
        {healthCheck ? `CID Sharing observed` : 'No CID Sharing observed'}
      </Badge>
    </div>
  </div>
}

export {ReportViewCidSharingHealth}