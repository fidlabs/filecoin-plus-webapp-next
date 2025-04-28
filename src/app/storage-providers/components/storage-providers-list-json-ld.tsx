import { JsonLd } from "@/components/json.ld";
import { type IStorageProvidersResponse } from "@/lib/interfaces/dmob/sp.interface";
import { type PropsWithChildren } from "react";
import { ItemList, WithContext } from "schema-dts";

export type StorageProvidersListJsonLdProps = PropsWithChildren<{
  storageProviders: IStorageProvidersResponse["data"];
}>;

export function StorageProvidersListJsonLd({
  children,
  storageProviders,
}: StorageProvidersListJsonLdProps) {
  const jsonLdData: WithContext<ItemList> = {
    "@context": "https://schema.org",
    name: "Allocators",
    "@type": "ItemList",
    itemListElement: storageProviders.map((sp, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@id": sp.provider,
        url: `https://datacapstats.io/storage-providers/${sp.provider}`,
        name: sp.provider,
      },
    })),
  };

  return <JsonLd data={jsonLdData}>{children}</JsonLd>;
}
