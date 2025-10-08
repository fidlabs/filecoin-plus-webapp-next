import { Container } from "@/components/container";
import { PageHeader, PageTitle } from "@/components/page-header";
import { QueryKey } from "@/lib/constants";
import { generatePageMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { SWRConfig, unstable_serialize } from "swr";
import { StorageProvidersListWidget } from "../components/storage-providers-list-widget";
import { fetchStorageProvidersList } from "../storage-providers-data";

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Storage Providers",
  description:
    "A convenient way to browse and search for Filecoin Plus Providers.",
  url: "https://datacapstats.io/storage-providers",
});

export default async function StorageProvidersPage() {
  const storageProvidersList = await fetchStorageProvidersList();

  return (
    <SWRConfig
      value={{
        fallback: {
          [unstable_serialize([QueryKey.STORAGE_PROVIDERS_LIST, {}])]:
            storageProvidersList,
        },
      }}
    >
      <PageHeader className="mb-8">
        <PageTitle>Storage Providers</PageTitle>
      </PageHeader>
      <Container>
        <StorageProvidersListWidget />
      </Container>
    </SWRConfig>
  );
}
