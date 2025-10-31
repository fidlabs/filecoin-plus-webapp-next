import { AllocatorsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default function AllocatorsBiggestAllocationPage() {
  permanentRedirect(
    `/allocators#${AllocatorsPageSectionId.CLIENT_DISTRIBUTION}`
  );
}
