import { AllocatorsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default function AllocatorAuditTimesChart() {
  permanentRedirect(`/allocators#${AllocatorsPageSectionId.AUDIT_TIMES}`);
}
