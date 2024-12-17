import {Metadata} from "next";
import {PageHeader, PageTitle} from "@/components/ui/title";
import {getAllocators, getGoogleSheetAuditSizes} from "@/lib/api";
import {Structure} from "@/app/allocator-tree/components/structure";

export const metadata: Metadata = {
  title: "Fil+ Dashboard | Allocators tree",
  description: "Fil+ Dashboard | Allocators tree",
}

const AllocatorsTreePage = async () => {

  const allocatorStatuses = await getGoogleSheetAuditSizes();
  const allAllocators = await getAllocators({
    page: '1',
    pageSize: '1000',
    showInactive: 'true',
  })

  return <main>
    <div className="main-content">
      <PageHeader>
        <PageTitle>Allocators tree</PageTitle>
      </PageHeader>
    </div>
    <div className="whitespace-pre flex gap-2">
      <Structure allocatorStatuses={allocatorStatuses} allAllocators={allAllocators}/>
    </div>
  </main>
};

export default AllocatorsTreePage;