import { JsonLd } from "@/components/json.ld";
import { IAllocatorsResponse } from "@/lib/interfaces/dmob/allocator.interface";
import { type PropsWithChildren } from "react";
import { ItemList, WithContext } from "schema-dts";

export type AllocatorsListJsonLdProps = PropsWithChildren<{
  allocators: IAllocatorsResponse["data"];
}>;

export function AllocatorsListJsonLd({
  allocators,
  children,
}: AllocatorsListJsonLdProps) {
  const jsonLdData: WithContext<ItemList> = {
    "@context": "https://schema.org",
    name: "Allocators",
    "@type": "ItemList",
    itemListElement: allocators.map((allocator, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@id": `https://datacapstats.io/allocators/${allocator.id}`,
        name: allocator.name,
      },
    })),
  };

  return <JsonLd data={jsonLdData}>{children}</JsonLd>;
}
