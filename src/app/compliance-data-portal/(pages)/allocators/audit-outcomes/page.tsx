import { AllocatorsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default function AllocatorsAuditOutcomesPage() {
  permanentRedirect(`/allocators#${AllocatorsPageSectionId.AUDIT_OUTCOMES}`);
}
