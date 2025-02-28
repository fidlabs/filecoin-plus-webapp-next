"use client";

import { allocatorsTabs } from "@/app/allocators/constants";
import {
  AllocatorAuditState,
  AllocatorBiggestAllocation,
  AllocatorRetrievability,
  AllocatorTrustLevels,
  ProviderComplianceAllocator,
} from "@/components/charts/compliance/allocators";
import { GenericContentHeader } from "@/components/generic-content-view";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CdpProvider } from "@/lib/providers/cdp.provider";

const AllocatorsCompliance = () => {
  return (
    <Card className="mt-[50px]">
      <GenericContentHeader
        placeholder="Allocator ID / Address / Name"
        selected={allocatorsTabs[1].value}
        navigation={allocatorsTabs}
      />
      <div className="flex flex-col">
        <CdpProvider>
          <AllocatorRetrievability plain />
          <Separator orientation="horizontal" />
          <AllocatorBiggestAllocation plain />
          <Separator orientation="horizontal" />
          <ProviderComplianceAllocator plain />
          <Separator orientation="horizontal" />
          <AllocatorAuditState plain />
          <Separator orientation="horizontal" />
          <AllocatorTrustLevels plain />
        </CdpProvider>
      </div>
    </Card>
  );
};

export { AllocatorsCompliance };
