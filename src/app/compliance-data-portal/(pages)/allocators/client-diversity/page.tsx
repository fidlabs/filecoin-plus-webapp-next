import { AllocatorsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default function AllocatorsClientDiversityPage() {
  permanentRedirect(`/allocators#${AllocatorsPageSectionId.CLIENT_DIVERSITY}`);
}
