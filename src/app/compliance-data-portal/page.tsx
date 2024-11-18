"use client";

import {useCDPUtils} from "@/app/compliance-data-portal/providers/cdp.provider";
import StorageProviderRetrievability from "@/app/compliance-data-portal/components/storage-providers/retrievability";
import StorageProviderNumberOfAllocations
  from "@/app/compliance-data-portal/components/storage-providers/number-of-allocations";
import StorageProviderBiggestAllocation
  from "@/app/compliance-data-portal/components/storage-providers/biggest-allocation";
import AllocatorRetrievability from "@/app/compliance-data-portal/components/allocators/retrievability";
import AllocatorBiggestAllocation from "@/app/compliance-data-portal/components/allocators/biggest-allocation";
import ProviderComplianceAllocator from "@/app/compliance-data-portal/components/allocators/provider-compliance";
import {AllocatorAuditState} from "@/app/compliance-data-portal/components/allocators/audit-state";

const CompliancePage = () => {

  const {scrollCallback} = useCDPUtils()

  return (
    <div className="w-full mb-[25%]">
      <h3>SPs</h3>
      <div className="flex flex-col gap-6 w-full mb-6">
        <StorageProviderRetrievability setCurrentElement={scrollCallback}/>
        <StorageProviderNumberOfAllocations setCurrentElement={scrollCallback}/>
        <StorageProviderBiggestAllocation setCurrentElement={scrollCallback}/>
      </div>
      <h3>Allocators</h3>
      <div className="flex flex-col gap-6 w-full mb-6">
        <AllocatorRetrievability setCurrentElement={scrollCallback}/>
        <AllocatorBiggestAllocation setCurrentElement={scrollCallback}/>
        <ProviderComplianceAllocator setCurrentElement={scrollCallback}/>
        <AllocatorAuditState setCurrentElement={scrollCallback}/>
      </div>
    </div>
  );
};

export default CompliancePage;