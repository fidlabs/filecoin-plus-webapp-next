import { AllocatorsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default function AllocatorsAuditStatePage() {
  permanentRedirect(`/allocators#${AllocatorsPageSectionId.AUDITS_STATE}`);
}
