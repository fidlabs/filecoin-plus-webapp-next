import { BackToTop } from "@/components/back-to-top";
import { Container } from "@/components/container";
import { PageHeader, PageSubtitle, PageTitle } from "@/components/page-header";
import {
  IdBasedStickyTabNaviation,
  IdBasedStickyTabNaviationProps,
} from "@/components/sticky-tab-navigation";
import {
  fetchPoRepDealsList,
  fetchPoRepOnboardedDataHistory,
  fetchPoRepSliComplianceHistory,
} from "@/lib/cdp";
import { PoRepProviderPageSectionId, QueryKey } from "@/lib/constants";
import { createPreloader } from "@/lib/data-loading";
import { F0Id, isF0IdInput } from "@/lib/f0-id";
import { permanentRedirect } from "next/navigation";
import { SWRConfig } from "swr";
import { PoRepProviderSLIPerformanceWidget } from "./components/po-rep-provider-sli-performance-widget";
import { PoRepProviderStorageWidget } from "./components/po-rep-provider-storage-widget";

export interface PageProps {
  params: { providerId: string };
}

const preloadDeals = createPreloader(
  QueryKey.PO_REP_DEALS_LIST,
  fetchPoRepDealsList
);
const preloadOnboardedDataHistory = createPreloader(
  QueryKey.PO_REP_ONBOARDED_DATA_HISTORY,
  fetchPoRepOnboardedDataHistory
);
const preloadPerformanceHistory = createPreloader(
  QueryKey.PO_REP_SLI_COMPLIANCE_HISTORY,
  fetchPoRepSliComplianceHistory
);

const sectionTabs = {
  [PoRepProviderPageSectionId.STORAGE]: "Storage",
  [PoRepProviderPageSectionId.SLI_PERFORMANCE]: "SLI Performance",
} as const satisfies IdBasedStickyTabNaviationProps["tabs"];

export default async function PoRepProviderPage({ params }: PageProps) {
  const { providerId } = params;

  if (!isF0IdInput(providerId)) {
    return permanentRedirect("/not-found");
  }

  const preloadedData = await Promise.all([
    preloadDeals({ providerId, page: 1, limit: 10 }),
    preloadDeals({ providerId, page: 1, limit: 10, activeOnly: true }),
    preloadOnboardedDataHistory({ providerId }),
    preloadPerformanceHistory({
      providerId,
      windowSize: "week",
      sliType: undefined,
    }),
  ]);

  const f0Id = F0Id.from(params.providerId);

  return (
    <SWRConfig
      value={{
        fallback: Object.fromEntries(preloadedData),
      }}
    >
      <>
        <PageHeader>
          <PageTitle>{f0Id.toString()}</PageTitle>
          <PageSubtitle>Provider Po-Rep Details</PageSubtitle>
        </PageHeader>

        <IdBasedStickyTabNaviation className="mb-8" tabs={sectionTabs} />

        <Container className="flex flex-col gap-y-8">
          <PoRepProviderStorageWidget
            id={PoRepProviderPageSectionId.STORAGE}
            providerId={f0Id.toBigInt()}
          />
          <PoRepProviderSLIPerformanceWidget
            id={PoRepProviderPageSectionId.SLI_PERFORMANCE}
            providerId={f0Id.toBigInt()}
          />
          <BackToTop />
        </Container>
      </>
    </SWRConfig>
  );
}
