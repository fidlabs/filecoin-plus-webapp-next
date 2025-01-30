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

const defaultMessages = {
  "STORAGE_PROVIDER_DISTRIBUTION_ALL_LOCATED_IN_THE_SAME_REGION": (status: boolean) => status ?
    "Storage providers are located in different regions" :
    "Storage providers are located in the same region",
  "STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_EXCEED_PROVIDER_DEAL": (status: boolean) => status ?
    "Storage provider distribution looks healthy" :
    "Storage provider distribution looks unhealthy",
  "STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_EXCEED_MAX_DUPLICATION": (status: boolean) => status ?
    "Storage provider duplication looks healthy":
    "Storage provider duplication looks unhealthy",
  "STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_UNKNOWN_LOCATION": (status: boolean) => status ?
    "Storage provider locations looks healthy" :
    "Storage provider locations looks unhealthy",
  "STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_RETRIEVABILITY_75": (status: boolean) => status ?
    "All storage providers have retrieval success rate more than 75%" :
    "Some of storage providers have retrieval success rate less than 75%",
  "STORAGE_PROVIDER_DISTRIBUTION_PROVIDERS_RETRIEVABILITY_ZERO": (status: boolean) => status ?
    "All storage providers have retrieval success rate more than 0%" :
    "Some of storage providers have retrieval success rate equal to 0%",
  "DEAL_DATA_REPLICATION_LOW_REPLICA": (status: boolean) => status ?
    "Low replica percentage" :
    "High replica percentage",
  "DEAL_DATA_REPLICATION_CID_SHARING": (status: boolean) => status ?
    "No CID sharing has been observed" :
    "CID sharing has been observed",
}

type DefaultMessageKeys = keyof typeof defaultMessages

const getDefaultMessage = (key: DefaultMessageKeys, status: boolean) => {
  return defaultMessages[key]?.(status) ?? key
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
              {item.result ? <ShieldCheckIcon/> : <ShieldXIcon/>}{item?.metadata?.msg ?? getDefaultMessage(item.check as DefaultMessageKeys, item.result)}
            </div>
          })
        }
      </HoverCardContent>
    </HoverCard>
  </div>
}

export {HealthCheck}