"use client";

import {
  StorageProviderRetrievability,
  StorageProviderNumberOfAllocations,
  StorageProviderBiggestAllocation,
  IpniMisreporting, ClientDiversitySP,
} from "@/components/charts/compliance/storage-providers";
import {
  AllocatorAuditState,
  AllocatorRetrievability,
  AllocatorBiggestAllocation,
  ProviderComplianceAllocator,
  AllocatorTrustLevels,
  AllocatorAuditTimeline, ClientDiversityAllocator
} from "@/components/charts/compliance/allocators/";
import {useCDPUtils} from "@/lib/providers/cdp.provider";
import {StorageProviderCompliance} from "@/components/charts/compliance/storage-providers/compliance";

const CompliancePage = () => {
  const {currentElement} = useCDPUtils();

  return (
    <div className="w-full">
      {currentElement === "RetrievabilityScoreSP" && (
        <StorageProviderRetrievability/>
      )}
      {currentElement === "NumberOfDealsSP" && (
        <StorageProviderNumberOfAllocations/>
      )}
      {currentElement === "BiggestDealsSP" && (
        <StorageProviderBiggestAllocation/>
      )}
      {currentElement === "ComplianceSP" && <StorageProviderCompliance/>}
      {currentElement === "IpniMisreporting" && <IpniMisreporting/>}
      {currentElement === "ClientDiversitySP" && <ClientDiversitySP/>}
      {currentElement === "RetrievabilityScoreAllocator" && (
        <AllocatorRetrievability/>
      )}
      {currentElement === "BiggestDealsAllocator" && (
        <AllocatorBiggestAllocation/>
      )}
      {currentElement === "ProviderComplianceAllocator" && (
        <ProviderComplianceAllocator/>
      )}
      {currentElement === "AuditStateAllocator" && <AllocatorAuditState/>}
      {currentElement === "AuditOutcomesAllocator" && <AllocatorTrustLevels/>}
      {currentElement === "AuditTimelineAllocator" && (
        <AllocatorAuditTimeline/>
      )}
      {currentElement === "ClientDiversityAllocator" && (
      <ClientDiversityAllocator/>
    )}
    </div>
  );
};

export default CompliancePage;
