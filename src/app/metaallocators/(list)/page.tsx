import { getAllocators } from "@/lib/api";
import { generatePageMetadata } from "@/lib/utils";
import { type Metadata } from "next";
import { MetaallocatorsList } from "./components/metaallocators-list";

interface PageProps {
  searchParams: Record<string, string>;
}

export const revalidate = 300;
export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Metaallocators",
  description:
    "A convenient way to browse and search for Filecoin Plus Metaallocators.",
  url: "https://datacapstats.io/metaallocators",
});

const defaultParams: Record<string, string> = {
  page: "1",
  limit: "10",
  showInactive: "false",
  isMetaallocator: "true",
};

export default async function MetaallocatorsPage({ searchParams }: PageProps) {
  const metaallocatorsResponse = await getAllocators({
    ...defaultParams,
    ...searchParams,
  });

  return <MetaallocatorsList metaallocatorsReponse={metaallocatorsResponse} />;
}
