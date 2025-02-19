"use client";

import {
  StorageProviderRetrievability,
  StorageProviderNumberOfAllocations,
  StorageProviderBiggestAllocation,
} from "@/components/charts/compliance/storage-providers";
import {
  AllocatorAuditState,
  AllocatorRetrievability,
  AllocatorBiggestAllocation,
  ProviderComplianceAllocator,
  AllocatorTrustLevels,
} from "@/components/charts/compliance/allocators/";
import {useCDPUtils} from "@/lib/providers/cdp.provider";
import {StorageProviderCompliance} from "@/components/charts/compliance/storage-providers/compliance";

const CompliancePage = () => {
  const {currentElement} = useCDPUtils();

  return (
    <div className="w-full">
      {currentElement === 'RetrievabilityScoreSP' && <StorageProviderRetrievability/>}
      {currentElement === 'NumberOfDealsSP' && <StorageProviderNumberOfAllocations/>}
      {currentElement === 'BiggestDealsSP' && <StorageProviderBiggestAllocation/>}
      {currentElement === "ComplianceSP" && <StorageProviderCompliance/>}
      {currentElement === 'RetrievabilityScoreAllocator' && <AllocatorRetrievability/>}
      {currentElement === 'BiggestDealsAllocator' && <AllocatorBiggestAllocation/>}
      {currentElement === 'ProviderComplianceAllocator' && <ProviderComplianceAllocator/>}
      {currentElement === 'AuditStateAllocator' && <AllocatorAuditState/>}
      {currentElement === 'AuditOutcomesAllocator' && <AllocatorTrustLevels/>}
    </div>
  );
};

export default CompliancePage;
