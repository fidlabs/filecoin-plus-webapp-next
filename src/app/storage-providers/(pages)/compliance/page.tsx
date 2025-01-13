import {Metadata} from "next";
import {Suspense} from "react";
import {
  StorageProvidersCompliance
} from "@/app/storage-providers/(pages)/compliance/components/storage-provider-compliance";

export const metadata: Metadata = {
  title: "Fil+ DataCap Stats | Storage Providers Complaince",
  description: "Fil+ DataCap Stats | Storage Providers Complaince",
}

const AllocatorsPage = () => {
  return <main className="main-content ">
    <Suspense>
      <StorageProvidersCompliance/>
    </Suspense>
  </main>
};

export default AllocatorsPage;