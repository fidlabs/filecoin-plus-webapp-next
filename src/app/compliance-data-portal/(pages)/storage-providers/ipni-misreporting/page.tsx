import { StorageProvidersPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default function IPNIMisreportingPage() {
  permanentRedirect(
    `/storage-providers#${StorageProvidersPageSectionId.IPNI_MISREPORTING}`
  );
}
