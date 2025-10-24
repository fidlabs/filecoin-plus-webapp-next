import { AllocatorsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default function ProviderComplianceAllocator() {
  permanentRedirect(`/allocators#${AllocatorsPageSectionId.COMPLIANCE}`);
}
