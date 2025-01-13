import {Metadata} from "next";
import {StorageProvidersList} from "@/app/storage-providers/components/storage-providers-list";
import {Suspense} from "react";
import {IStorageProvidersQuery} from "@/lib/interfaces/api.interface";
import {getStorageProviders} from "@/lib/api";
import {ItemList, WithContext} from "schema-dts";
import {JsonLd} from "@/components/json.ld";

export const metadata: Metadata = {
  title: "Fil+ DataCap Stats | Storage Providers",
  description: "A convenient way to browse and search for Filecoin Plus Providers.",
}

interface PageProps {
  searchParams: IStorageProvidersQuery;
}

const StorageProvidersPage = async ({searchParams}: PageProps) => {

  const currentParams = {
    page: searchParams?.page ?? '1',
    limit: searchParams?.limit ?? '10',
    filter: searchParams?.filter ?? '',
    sort: searchParams?.sort ?? '',
  }
  const sps = await getStorageProviders(currentParams)

  const listJsonLD: WithContext<ItemList> = {
    "@context": "https://schema.org",
    "name": "Allocators",
    "@type": "ItemList",
    itemListElement: sps?.data.map((sp, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@id": sp.provider,
        "url": `https://datacapstats.io/storage-providers/${sp.provider}`,
        name: sp.provider,
      }
    }))
  }

  return <JsonLd data={listJsonLD}>
    <main className="main-content">
      <Suspense>
        <StorageProvidersList sps={sps} params={currentParams}/>
      </Suspense>
    </main>
  </JsonLd>
};

export default StorageProvidersPage;