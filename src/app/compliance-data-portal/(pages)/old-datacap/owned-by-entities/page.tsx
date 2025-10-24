import { AllocatorsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default function OldDatacapOwnedByAllocatorsPage() {
  permanentRedirect(`/allocators#${AllocatorsPageSectionId.OLD_DATACAP}`);
}
