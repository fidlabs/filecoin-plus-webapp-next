"use client";

import {useCDPUtils} from "@/app/compliance-data-portal/providers/cdp.provider";
import StorageProviderRetrievability from "@/app/compliance-data-portal/components/storage-providers/retrievability";
import StorageProviderNumberOfAllocations
  from "@/app/compliance-data-portal/components/storage-providers/numberOfAllocations";
import StorageProviderBiggestAllocation
  from "@/app/compliance-data-portal/components/storage-providers/biggestAllocation";

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
      <>
        {/*<RetrievabilityScoreAllocator setCurrentElement={scrollCallback}/>*/}
        {/*<BiggestDealsAllocator setCurrentElement={scrollCallback}/>*/}
        {/*<ProviderComplianceAllocator setCurrentElement={scrollCallback}/>*/}
        {/*<AuditStateAllocator setCurrentElement={scrollCallback}/>*/}
      </>
    </div>
  );
};

export default CompliancePage;