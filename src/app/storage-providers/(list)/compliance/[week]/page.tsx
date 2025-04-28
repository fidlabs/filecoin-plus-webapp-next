import { StorageProvidersList } from "@/app/storage-providers/components/storage-providers-list";
import { StorageProvidersListJsonLd } from "@/app/storage-providers/components/storage-providers-list-json-ld";
import { getStorageProvidersByCompliance } from "@/lib/api";
import { generatePageMetadata } from "@/lib/utils";
import { weekFromString, weekToUTCDate } from "@/lib/weeks";
import { Metadata } from "next";

interface PageProps {
  params: { week: string };
  searchParams: Record<string, string>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: `Fil+ DataCap Stats | Storage Providers by Compliance ${params.week}`,
    description:
      "A convenient way to browse and search for Filecoin Plus Providers.",
    url: `https://datacapstats.io/storage-providers/compliance/${params.week}`,
  });
}

const defaultFilters = {
  page: "1",
  limit: "10",
  retrievability: "true",
  numberOfClients: "true",
  totalDealSize: "true",
};

function fetchData(week: string, searchParams: Record<string, string>) {
  const filters = {
    ...defaultFilters,
    ...searchParams,
    week: week ? weekToUTCDate(weekFromString(week)).toISOString() : undefined,
  };

  return getStorageProvidersByCompliance(filters);
}

export default async function CompliantStorageProvidersPage({
  params,
  searchParams,
}: PageProps) {
  const storageProvidersResponse = await fetchData(params.week, searchParams);

  return (
    <StorageProvidersListJsonLd
      storageProviders={storageProvidersResponse.data}
    >
      <StorageProvidersList
        storageProviders={storageProvidersResponse.data}
        totalCount={storageProvidersResponse.count}
      />
    </StorageProvidersListJsonLd>
  );
}
