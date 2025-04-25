import { StorageProvidersList } from "@/app/storage-providers/components/storage-providers-list";
import { getStorageProviders } from "@/lib/api";
import { IStorageProvidersQuery } from "@/lib/interfaces/api.interface";
import { generatePageMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { StorageProvidersListJsonLd } from "../components/storage-providers-list-json-ld";
import { StorageProvidersListAddons } from "../components/storage-providers-list-addons";

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Storage Providers",
  description:
    "A convenient way to browse and search for Filecoin Plus Providers.",
  url: "https://datacapstats.io/storage-providers",
});

interface PageProps {
  searchParams: IStorageProvidersQuery;
}

const defaultParams = {
  page: "1",
  limit: "10",
};

export default async function StorageProvidersPage({
  searchParams,
}: PageProps) {
  const storageProvidersResponse = await getStorageProviders({
    ...defaultParams,
    ...searchParams,
  });

  return (
    <StorageProvidersListJsonLd
      storageProviders={storageProvidersResponse.data}
    >
      <div className="px-4 pt-6 flex flex-wrap gap-4 items-center justify-between">
        <h2 className="text-lg font-medium">Storage Providers List</h2>
        <StorageProvidersListAddons />
      </div>

      <StorageProvidersList
        storageProviders={storageProvidersResponse.data}
        totalCount={storageProvidersResponse.count}
      />
    </StorageProvidersListJsonLd>
  );
}
