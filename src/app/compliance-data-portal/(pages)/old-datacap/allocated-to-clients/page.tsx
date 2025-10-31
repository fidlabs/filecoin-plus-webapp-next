import { AllocatorsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default async function OldDatacapAllocatedToClientsPage() {
  permanentRedirect(`/allocators#${AllocatorsPageSectionId.OLD_DATACAP}`);
}
