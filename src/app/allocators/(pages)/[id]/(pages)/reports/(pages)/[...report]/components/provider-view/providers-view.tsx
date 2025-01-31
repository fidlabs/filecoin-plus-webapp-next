"use client"
import {
  useReportsDetails
} from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";
import {
  ProviderMap
} from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/provider-map";
import {
  ProviderTable
} from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/components/provider-view/provider-table";

const ProvidersView = () => {
  const {
    colsStyle,
    colsSpanStyle,
    providersDistribution,
  } = useReportsDetails()


  return <div className="grid" style={colsStyle}>
    <div className="p-4 border-b" style={colsSpanStyle}>
      <h2 className="font-semibold text-lg">Storage Provider Distribution</h2>
      <p className="pt-2">The below table shows the distribution of storage providers that have stored data for this
        allocator.</p>
    </div>
    {
      providersDistribution.map((providerDistribution, index) => {
        return <div key={index} className="border-b [&:not(:last-child)]:border-r-2">
          <div className="px-4 flex items-center gap-1">
            Number of providers: {providerDistribution.length}
          </div>
          <ProviderTable providerDistribution={providerDistribution}/>
          <ProviderMap providerDistribution={providerDistribution}/>
        </div>
      })
    }
  </div>
}

export {ProvidersView}