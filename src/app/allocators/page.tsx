import {Metadata} from "next";
import {AllocatorsList} from "@/app/allocators/components/allocators-list";
import {Suspense} from "react";
import {IAllocatorsQuery} from "@/lib/interfaces/api.interface";
import {getAllocators} from "@/lib/api";
import {ItemList, WithContext} from "schema-dts";
import {JsonLd} from "@/components/json.ld";
import {generatePageMetadata} from "@/lib/utils";

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Allocators",
  description: "A convenient way to browse and search for Filecoin Plus Allocators.",
  url: "https://datacapstats.io/allocators",
})

interface PageProps {
  searchParams: IAllocatorsQuery;
}

const AllocatorsPage = async ({searchParams}: PageProps) => {
  const currentParams = {
      page: searchParams?.page ?? '1',
      showInactive: searchParams?.showInactive ?? 'false',
      limit: searchParams?.limit ?? '10',
      filter: searchParams?.filter ?? '',
      sort: searchParams?.sort ?? '',
  }
  const allocators = await getAllocators(currentParams)

  const listJsonLD: WithContext<ItemList> = {
    "@context": "https://schema.org",
    "name": "Allocators",
    "@type": "ItemList",
    itemListElement: allocators?.data.map((allocator, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@id": `https://datacapstats.io/allocators/${allocator.id}`,
        name: allocator.name,
      }
    }))
  }

  return <JsonLd data={listJsonLD}>
    <main>
      <Suspense>
        <AllocatorsList allocators={allocators} params={currentParams}/>
      </Suspense>
    </main>
  </JsonLd>
};

export default AllocatorsPage;