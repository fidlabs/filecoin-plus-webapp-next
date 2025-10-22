import { AllocatorsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default function AllocatorRetrievabilityPage() {
  permanentRedirect(`/allocators#${AllocatorsPageSectionId.RETRIEVABILITY}`);
}
