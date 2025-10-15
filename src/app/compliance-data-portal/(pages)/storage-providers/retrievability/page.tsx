import { StorageProvidersPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

export default function StorageProviderRetrievabilityPage() {
  permanentRedirect(
    `/storage-providers#${StorageProvidersPageSectionId.RETRIEVABILITY}`
  );
}
