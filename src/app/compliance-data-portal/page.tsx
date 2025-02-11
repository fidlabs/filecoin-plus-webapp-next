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
import { useCDPUtils } from "@/lib/providers/cdp.provider";
import { StorageProviderCompliance } from "@/components/charts/compliance/storage-providers/compliance";

const CompliancePage = () => {
  const { currentElement } = useCDPUtils();

  return (
    <div className="w-full">
      <StorageProviderRetrievability currentElement={currentElement} />
      <StorageProviderNumberOfAllocations currentElement={currentElement} />
      <StorageProviderBiggestAllocation currentElement={currentElement} />
      {currentElement === "ComplianceSP" && <StorageProviderCompliance />}
      <AllocatorRetrievability currentElement={currentElement} />
      <AllocatorBiggestAllocation currentElement={currentElement} />
      <ProviderComplianceAllocator currentElement={currentElement} />
      <AllocatorAuditState currentElement={currentElement} />
      <AllocatorTrustLevels currentElement={currentElement} />
    </div>
  );
};

export default CompliancePage;
