import { StorageProvidersListJsonLd } from "@/app/storage-providers/components/storage-providers-list-json-ld";
import { fetchStorageProvidersComplianceDataWeeks } from "@/app/storage-providers/storage-providers-data";
import { Container } from "@/components/container";
import { PageHeader, PageTitle } from "@/components/page-header";
import { getStorageProvidersByCompliance } from "@/lib/api";
import { generatePageMetadata } from "@/lib/utils";
import {
  safeWeekFromString,
  weekFromString,
  weekToString,
  weekToUTCDate,
} from "@/lib/weeks";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { StorageProvidersComplianceListWidget } from "./components/storage-providers-compliance-list-widget";

export const revalidate = 300;

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
  const [weeks, storageProvidersResponse] = await Promise.all([
    fetchStorageProvidersComplianceDataWeeks(),
    fetchData(params.week, searchParams),
  ]);

  const selectedWeek = safeWeekFromString(params.week);

  if (weeks.length === 0) {
    return redirect("/storage-providers");
  }

  if (
    !selectedWeek ||
    !weeks.some(
      (week) =>
        week.weekNumber === selectedWeek.weekNumber &&
        week.year === selectedWeek.year
    )
  ) {
    return redirect(`/storage-providers/compliance/${weekToString(weeks[0])}`);
  }

  return (
    <StorageProvidersListJsonLd
      storageProviders={storageProvidersResponse.data}
    >
      <PageHeader className="mb-8">
        <PageTitle>Storage Providers by Compliance</PageTitle>
      </PageHeader>
      <Container>
        <StorageProvidersComplianceListWidget
          storageProvidersList={{
            storageProviders: storageProvidersResponse.data,
            totalCount: storageProvidersResponse.count,
          }}
          selectedWeek={selectedWeek}
          weeks={weeks}
        />
      </Container>
    </StorageProvidersListJsonLd>
  );
}
