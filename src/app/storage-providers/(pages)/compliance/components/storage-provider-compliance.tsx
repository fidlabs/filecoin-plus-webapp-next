"use client"
import {useMemo} from "react";
import {ITabNavigatorTab} from "@/components/ui/tab-navigator";
import {Card} from "@/components/ui/card";
import {GenericContentHeader} from "@/components/generic-content-view";
import {
  StorageProviderBiggestAllocation, StorageProviderNumberOfAllocations, StorageProviderRetrievability
} from "@/components/charts/compliance/storage-providers";
import {CdpProvider} from "@/lib/providers/cdp.provider";


const StorageProvidersCompliance = () => {


  const tabs = useMemo(() => {
    return [
      {
        label: 'Storage Providers',
        href: '/storage-providers',
        value: 'list'
      }, {
        label: 'Compliance',
        href: '/storage-providers/compliance',
        value: 'compliance'
      }
    ] as ITabNavigatorTab[]
  }, [])

  return <Card className="mt-[50px]">
    <GenericContentHeader placeholder="Allocator ID / Address / Name"
                          selected={tabs[1].value}
                          navigation={tabs}/>
    <div className="flex flex-col">
      <CdpProvider>
        <StorageProviderRetrievability plain/>
        <StorageProviderBiggestAllocation plain/>
        <StorageProviderNumberOfAllocations plain/>
      </CdpProvider>
    </div>
  </Card>
}

export {StorageProvidersCompliance}