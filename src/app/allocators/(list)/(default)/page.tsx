import { AllocatorsList } from "@/app/allocators/components/allocators-list";
import { getAllocators } from "@/lib/api";
import { generatePageMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { AllocatorsListJsonLd } from "../../components/allocators-list-json-ld";

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Allocators",
  description:
    "A convenient way to browse and search for Filecoin Plus Allocators.",
  url: "https://datacapstats.io/allocators",
});

interface PageProps {
  searchParams: Record<string, string>;
}

const defaultParams: Record<string, string> = {
  page: "1",
  limit: "10",
  showInactive: "false",
};

export default async function AllocatorsPage({ searchParams }: PageProps) {
  const allocatorsResponse = await getAllocators({
    ...defaultParams,
    ...searchParams,
  });

  return (
    <AllocatorsListJsonLd allocators={allocatorsResponse.data}>
      <AllocatorsList allocatorsResponse={allocatorsResponse} />
    </AllocatorsListJsonLd>
  );
}
