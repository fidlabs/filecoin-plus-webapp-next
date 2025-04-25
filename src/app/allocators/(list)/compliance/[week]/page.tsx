import { AllocatorsList } from "@/app/allocators/components/allocators-list";
import { AllocatorsListJsonLd } from "@/app/allocators/components/allocators-list-json-ld";
import { getAllocatorsByCompliance } from "@/lib/api";
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
    title: `Fil+ DataCap Stats | Al;ocators by SPs Compliance ${params.week}`,
    description:
      "A convenient way to browse and search for Filecoin Plus Allocators.",
    url: `https://datacapstats.io/allocators/compliance/${params.week}`,
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

  return getAllocatorsByCompliance(filters);
}

export default async function CompliantAllocatorsPage({
  params,
  searchParams,
}: PageProps) {
  const allocatorsResponse = await fetchData(params.week, searchParams);

  return (
    <AllocatorsListJsonLd allocators={allocatorsResponse.data}>
      <AllocatorsList allocatorsResponse={allocatorsResponse} />
    </AllocatorsListJsonLd>
  );
}
