"use client"
import {useMemo} from "react";
import {ITabNavigatorTab} from "@/components/ui/tab-navigator";
import {Card} from "@/components/ui/card";
import {GenericContentHeader} from "@/components/generic-content-view";
import {
  AllocatorRetrievability,
  AllocatorBiggestAllocation,
  AllocatorAuditState,
  ProviderComplianceAllocator, AllocatorTrustLevels
} from "@/components/charts/compliance/allocators";
import {CdpProvider} from "@/lib/providers/cdp.provider";
import {Separator} from "@/components/ui/separator";


const AllocatorsCompliance = () => {

  const tabs = useMemo(() => {
    return [
      {
        label: 'Allocators',
        href: '/allocators',
        value: 'allocators'
      }, {
        label: 'Compliance',
        href: '/allocators/compliance',
        value: 'compliance'
      }, {
        label: 'Tree structure',
        href: '/allocators/allocator-tree',
        value: 'tree'
      }
    ] as ITabNavigatorTab[]
  }, [])

  return <Card className="mt-[50px]">
    <GenericContentHeader placeholder="Allocator ID / Address / Name"
                          selected={tabs[1].value}
                          navigation={tabs}/>
    <div className="flex flex-col">
      <CdpProvider>
        <AllocatorRetrievability plain/>
        <Separator orientation="horizontal"/>
        <AllocatorBiggestAllocation plain/>
        <Separator orientation="horizontal"/>
        <ProviderComplianceAllocator plain/>
        <Separator orientation="horizontal"/>
        <AllocatorAuditState plain/>
        <Separator orientation="horizontal"/>
        <AllocatorTrustLevels plain/>
      </CdpProvider>
    </div>
  </Card>
}

export {AllocatorsCompliance}