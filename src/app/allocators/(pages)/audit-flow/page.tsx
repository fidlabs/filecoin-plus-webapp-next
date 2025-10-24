import { AllocatorsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default function AllocatorsAuditsFlowPage() {
  permanentRedirect(`/allocators#${AllocatorsPageSectionId.AUDITS_FLOW}`);
}
