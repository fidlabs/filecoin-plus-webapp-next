import { BackToTop } from "@/components/back-to-top";
import { Container } from "@/components/container";
import { PageHeader, PageTitle } from "@/components/page-header";
import {
  IdBasedStickyTabNaviation,
  type IdBasedStickyTabNaviationProps,
} from "@/components/sticky-tab-navigation";
import { StorageProviderDetailsPageSectionId } from "@/lib/constants";
import { generatePageMetadata } from "@/lib/utils";
import { type Metadata } from "next";
import { type PropsWithChildren, Suspense } from "react";

interface IPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: IPageProps): Promise<Metadata> {
  const { id } = params;

  return generatePageMetadata({
    title: `Fil + | Storage Provider ${id}`,
    description: `Storage Provider ${id} details`,
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
  return (
    <>
      <PageHeader>
        <PageTitle className="mb-2">{params.id}</PageTitle>
      </PageHeader>
      <IdBasedStickyTabNaviation className="mb-8" tabs={sectionTabs} />
      <Container>
        <Suspense>{children}</Suspense>
        <BackToTop />
      </Container>
    </>
  );
}
