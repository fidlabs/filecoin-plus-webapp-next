"use client";

import {useCDPUtils} from "@/app/compliance-data-portal/providers/cdp.provider";
import StorageProviderRetrievability from "@/app/compliance-data-portal/components/storage-providers/retrievability";

const CompliancePage = () => {

  const {scrollCallback} = useCDPUtils()

  return (
    <div className="w-full mb-[25%]">
      <h3>SPs</h3>
      <>
        <StorageProviderRetrievability setCurrentElement={scrollCallback}/>
        {/*<NumberOfDealsSP setCurrentElement={scrollCallback}/>*/}
        {/*<BiggestDealsSP setCurrentElement={scrollCallback}/>*/}
      </>
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