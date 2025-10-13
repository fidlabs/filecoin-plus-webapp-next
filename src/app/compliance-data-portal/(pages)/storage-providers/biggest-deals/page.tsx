import { StorageProvidersPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default function StorageProviderBiggestAllocation() {
  permanentRedirect(
    `/storage-providers#${StorageProvidersPageSectionId.CLIENT_DISTRIBUTION}`
  );
}
