import {
  fetchAllocatorsByCompliance,
  FetchAllocatorsByComplianceParameters,
  fetchAllocatorsSPsComplianceData,
} from "@/app/allocators/allocators-data";
import { AllocatorsListJsonLd } from "@/app/allocators/components/allocators-list-json-ld";
import { generatePageMetadata } from "@/lib/utils";
import {
  safeWeekFromString,
  weekFromDate,
  weekToString,
  weekToUTCDate,
} from "@/lib/weeks";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AllocatorsByComplianceWidget } from "./components/allocators-by-compliance-widget";

export const revalidate = 300;

interface PageProps {
  params: { week: string };
  searchParams: Record<string, string | undefined>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    title: `Fil+ DataCap Stats | Allocators by SPs Compliance ${params.week}`,
    description:
      "A convenient way to browse and search for Filecoin Plus Allocators.",
    url: `https://datacapstats.io/allocators/compliance/${params.week}`,
  });
}

function searchParamsToFetchParams(
  searchParams: PageProps["searchParams"]
): FetchAllocatorsByComplianceParameters {
  return {
    page: safeStringToInt(searchParams.page, 1),
    limit: safeStringToInt(searchParams.limit, 1),
    sort: searchParams.sort,
    order:
      searchParams.order === "asc" || searchParams.order === "desc"
        ? searchParams.order
        : undefined,
    filter: searchParams.filter,
    complianceThresholdPercentage: safeStringToInt(
      searchParams.complianceThresholdPercentage,
      50
    ),
    httpRetrievability: searchParams.httpRetrievability !== "false",
    urlFinderRetrievability: searchParams.urlFinderRetrievability !== "false",
    numberOfClients: searchParams.numberOfClients !== "false",
    totalDealSize: searchParams.totalDealSize !== "false",
  };
}

export default async function CompliantAllocatorsPage({
  params,
  searchParams,
}: PageProps) {
  const complianceData = await fetchAllocatorsSPsComplianceData();
  const weeks = complianceData.results.map((result) =>
    weekFromDate(result.week)
  );
  const selectedWeek = safeWeekFromString(params.week);

  if (weeks.length === 0) {
    return redirect("/allocators");
  }

  if (
    !selectedWeek ||
    !weeks.some(
      (week) =>
        week.weekNumber === selectedWeek.weekNumber &&
        week.year === selectedWeek.year
    )
  ) {
    return redirect(`/allocators/compliance/${weekToString(weeks[0])}`);
  }

  const allocatorsResponse = await fetchAllocatorsByCompliance({
    ...searchParamsToFetchParams(searchParams),
    week: weekToUTCDate(selectedWeek).toISOString(),
  });

  return (
    <AllocatorsListJsonLd allocators={allocatorsResponse.data}>
      <AllocatorsByComplianceWidget
        data={allocatorsResponse}
        selectedWeek={selectedWeek}
        weeks={weeks}
      />
    </AllocatorsListJsonLd>
  );
}

function safeStringToInt(
  input: string | undefined,
  defaultValue: number
): number {
  if (typeof input !== "string") {
    return defaultValue;
  }

  const numericValue = parseInt(input, 10);
  return isNaN(numericValue) ? defaultValue : numericValue;
}
