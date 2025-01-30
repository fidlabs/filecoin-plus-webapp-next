"use client"
import {
  useReportsDetails
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {
  ReportViewProviderMap
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/report-view-provider-map";
import {
  ReportViewProviderTable
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/report-view-provider-table";
import {
  HealthCheck
} from "@/app/clients/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/health-check";

const ReportViewProviders = () => {
  const {
    colsStyle,
    colsSpanStyle,
    providerDistributionList,
    securityChecks
  } = useReportsDetails()


  return <div className="grid" style={colsStyle}>
    <div className="p-4 border-b" style={colsSpanStyle}>
      <h2 className="font-semibold text-lg">Storage Provider Distribution</h2>
      <p className="pt-2">The below table shows the distribution of storage providers that have stored data for this
        client.</p>
    </div>
    {
      providerDistributionList.map((providerDistribution, index) => {
        return <div key={index} className="border-b [&:not(:last-child)]:border-r-2">
          <div className="flex items-center gap-1">
            {securityChecks[index] && <HealthCheck
              security={securityChecks[index]?.filter(item => item.check.startsWith("STORAGE_PROVIDER_DISTRIBUTION"))}/>}
            Number of providers: {providerDistribution.length}
          </div>
          <ReportViewProviderTable providerDistribution={providerDistribution}/>
          <ReportViewProviderMap providerDistribution={providerDistribution}/>
        </div>
      })
    }
  </div>
}

export {ReportViewProviders}