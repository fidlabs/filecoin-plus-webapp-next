import {Metadata} from "next";
import {StorageProvidersList} from "@/app/storage-providers/components/storage-providers-list";

export const metadata: Metadata = {
  title: "Fil+ Dashboard | Storage Providers",
  description: "Fil+ Dashboard | Storage Providers",
}

const StorageProvidersPage = () => {
  return <StorageProvidersList/>
};

export default StorageProvidersPage;