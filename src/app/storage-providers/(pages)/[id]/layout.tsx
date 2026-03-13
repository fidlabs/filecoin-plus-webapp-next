import { BackToTop } from "@/components/back-to-top";
import { Container } from "@/components/container";
import { FilecoinPulseButton } from "@/components/filecoin-pulse-button";
import { PageHeader, PageTitle } from "@/components/page-header";
import {
  IdBasedStickyTabNaviation,
  type IdBasedStickyTabNaviationProps,
} from "@/components/sticky-tab-navigation";
import { getStorageProviderById } from "@/lib/api";
import { StorageProviderDetailsPageSectionId } from "@/lib/constants";
import { createStorageProviderLink } from "@/lib/filecoin-pulse";
import { generatePageMetadata } from "@/lib/utils";
import { type Metadata } from "next";
import { cache, type PropsWithChildren, Suspense } from "react";

const fetchData = cache(async (id: string) => {
  return await getStorageProviderById(id, {
    page: "1",
    limit: "10",
  });
});

interface IPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: IPageProps): Promise<Metadata> {
  const { id } = params;

  const spResponse = await fetchData(id);

  if (!spResponse) {
    return {
      title: "404",
    };
  }

  return generatePageMetadata({
    title: `Fil + | Storage Provider ${spResponse.providerId}`,
    description: `Storage Provider ${spResponse.providerId} details`,
    url: `https://datacapstats.io/storage-providers/${id}`,
  });
}

const sectionTabs = {
  [StorageProviderDetailsPageSectionId.STATS]: "Statistics",
  [StorageProviderDetailsPageSectionId.CLIENTS]: "Verified Clients",
  [StorageProviderDetailsPageSectionId.RETRIEVABILITY]: "Retrievability",
  [StorageProviderDetailsPageSectionId.TTFB]: "TTFB",
  [StorageProviderDetailsPageSectionId.BANDWIDTH]: "Bandwidth",
} as const satisfies IdBasedStickyTabNaviationProps["tabs"];

export default async function StorageProviderDetailsLayout({
  children,
  params,
}: PropsWithChildren<IPageProps>) {
  const spResponse = await fetchData(params.id);

  return (
    <>
      <PageHeader>
        <PageTitle className="mb-2">{spResponse?.providerId}</PageTitle>
        <FilecoinPulseButton url={createStorageProviderLink(params.id)}>
          <span className="lg:hidden">Pulse</span>
          <span className="hidden lg:inline">View on Filecoin Pulse</span>
        </FilecoinPulseButton>
      </PageHeader>
      <IdBasedStickyTabNaviation className="mb-8" tabs={sectionTabs} />
      <Container>
        <Suspense>{children}</Suspense>
        <BackToTop />
      </Container>
    </>
  );
}
