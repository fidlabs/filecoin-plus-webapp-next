import { StorageProvidersPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default function StorageProviderNumberOfAllocations() {
  permanentRedirect(
    `/storage-providers#${StorageProvidersPageSectionId.CLIENT_DIVERSITY}`
  );
}
