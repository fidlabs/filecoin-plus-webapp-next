import { StorageProvidersPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default function StorageProviderCompliance() {
  permanentRedirect(
    `/storage-providers#${StorageProvidersPageSectionId.COMPLIANCE}`
  );
}
