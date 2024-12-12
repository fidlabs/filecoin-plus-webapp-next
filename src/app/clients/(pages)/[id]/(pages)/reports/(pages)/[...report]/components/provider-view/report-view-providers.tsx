"use client"
import {
  useReportsDetails
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {InfoIcon} from "lucide-react";
import {
  ReportViewProviderMap
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/report-view-provider-map";
import {
  ReportViewProviderHealth
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/report-view-provider-health";
import {
  ReportViewProviderTable
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/report-view-provider-table";

const ReportViewProviders = () => {

  const {
    colsStyle,
    colsSpanStyle,
    providerDistributionList
  } = useReportsDetails()


  return <div className="grid" style={colsStyle}>
    <div className="p-4 border-b" style={colsSpanStyle}>
      <div className="flex gap-2 items-center">
        <h2 className="font-semibold text-lg">Storage Provider Distribution</h2>
        <HoverCard>
          <HoverCardTrigger asChild>
            <InfoIcon size={20} className="text-muted-foreground cursor-help"/>
          </HoverCardTrigger>
          <HoverCardContent className="w-full mx-6">
            <p>For most of the datacap application, below restrictions should apply.</p>
            <ul className="list-disc">
              <li className="ml-4">Storage provider should not exceed 25% of total datacap.</li>
              <li className="ml-4">Storage provider should not be storing duplicate data for more than 20%.</li>
              <li className="ml-4">Storage provider should have published its public IP address.</li>
              <li className="ml-4">All storage providers should be located in different regions.</li>
            </ul>
          </HoverCardContent>
        </HoverCard>
      </div>
      <p className="pt-2">The below table shows the distribution of storage providers that have stored data for this
        client.</p>
    </div>
    {
      providerDistributionList.map((providerDistribution, index) => {
        return <div key={index} className="border-b [&:not(:last-child)]:border-r-2">
          <ReportViewProviderHealth providerDistribution={providerDistribution}/>
          <ReportViewProviderTable providerDistribution={providerDistribution}/>
          <ReportViewProviderMap providerDistribution={providerDistribution}/>
        </div>
      })
    }
  </div>
}

export {ReportViewProviders}