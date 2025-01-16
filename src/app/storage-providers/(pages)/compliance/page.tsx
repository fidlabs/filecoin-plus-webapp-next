import {Metadata} from "next";
import {Suspense} from "react";
import {
  StorageProvidersCompliance
} from "@/app/storage-providers/(pages)/compliance/components/storage-provider-compliance";
import {generatePageMetadata} from "@/lib/utils";

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Storage Providers Complaince",
  description: "Fil+ DataCap Stats | Storage Providers Complaince",
  url: "https://datacapstats.io/storage-providers/compliance",
})

const AllocatorsPage = () => {
  return <main className="main-content ">
    <Suspense>
      <StorageProvidersCompliance/>
    </Suspense>
  </main>
};

export default AllocatorsPage;