import {Metadata} from "next";
import {StorageProvidersList} from "@/app/storage-providers/components/storage-providers-list";
import {Suspense} from "react";

export const metadata: Metadata = {
  title: "Fil+ Dashboard | Storage Providers",
  description: "Fil+ Dashboard | Storage Providers",
}

const StorageProvidersPage = () => {
  return <Suspense>
    <StorageProvidersList/>
  </Suspense>
};

export default StorageProvidersPage;