import { Container } from "@/components/container";
import { PageHeader, PageSubtitle, PageTitle } from "@/components/page-header";
import {
  IdBasedStickyTabNaviation,
  type IdBasedStickyTabNaviationProps,
} from "@/components/sticky-tab-navigation";
import { AllocatorsPageSectionId, QueryKey } from "@/lib/constants";
import { generatePageMetadata } from "@/lib/utils";
import { type Metadata } from "next";
import { SWRConfig, unstable_serialize } from "swr";
import { AllocatorsListWidget } from "./components/allocators-list-widget";
import {
  fetchAllocators,
  fetchAllocatorScoreRanking,
  FetchAllocatorsParameters,
  fetchAllocatorsSPsComplianceData,
  FetchAllocatorsSPsComplianceDataParameters,
} from "./allocators-data";
import { MetaallocatorsListWidget } from "./components/metaallocators-list-widget";
import { DCFlowWidget } from "./components/dc-flow-widget";
import {
  fetchAllocatorsAuditStates,
  FetchAllocatorsAuditStatesParameters,
} from "@/lib/api";
import { AuditsFlowWidget } from "./components/audits-flow-widget";
import { AllocatorsLeaderboards } from "./components/allocators-leaderboards";
import { AllocatorsSPsComplianceWidget } from "./components/allocators-sps-compliance-widget";

export const revalidate = 300;

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Allocators",
  description: "Compliance dashboard and listing for Allocators.",
  url: "https://datacapstats.io/allocators",
});

const sectionTabs = {
  [AllocatorsPageSectionId.COMPLIANCE]: "Compliance",
  [AllocatorsPageSectionId.ALLOCATORS_LIST]: "Allocators List",
  [AllocatorsPageSectionId.METAALLOCATORS_LIST]: "Metaallocators List",
  [AllocatorsPageSectionId.DC_FLOW]: "DC Flow",
  [AllocatorsPageSectionId.AUDITS_FLOW]: "Audits Flow",
  [AllocatorsPageSectionId.LEADERBOARDS]: "Leaderboards",
} as const satisfies IdBasedStickyTabNaviationProps["tabs"];

const allocatorsListDefaultParameters: FetchAllocatorsParameters = {
  page: 1,
  limit: 10,
  filter: "",
  showInactive: false,
  isMetaallocator: false,
};

const metaallocatorsListDefaultParameters: FetchAllocatorsParameters = {
  page: 1,
  limit: 10,
  filter: "",
  showInactive: true,
  isMetaallocator: true,
};

const auditsFlowDefaultParameters: FetchAllocatorsAuditStatesParameters = {
  editionId: "6",
};

const complianceDefaultParameters: FetchAllocatorsSPsComplianceDataParameters =
  {
    editionId: undefined,
    retrievability: true,
    numberOfClients: true,
    totalDealSize: true,
  };

export default async function AllocatorsPage() {
  const fallbackRequests = Promise.allSettled([
    fetchAllocators(allocatorsListDefaultParameters),
    fetchAllocators(metaallocatorsListDefaultParameters),
    fetchAllocatorsAuditStates(auditsFlowDefaultParameters),
    fetchAllocatorsSPsComplianceData(complianceDefaultParameters),
  ]);

  const [settledResults, allocatorScoreRanking] = await Promise.all([
    fallbackRequests,
    fetchAllocatorScoreRanking(),
  ]);

  const [
    fetchAllocatorsResult,
    fetchMetaalloctorsResult,
    auditsFlowResult,
    complianceResult,
  ] = settledResults;

  const fallback = {
    [unstable_serialize([
      QueryKey.ALLOCATORS_LIST,
      allocatorsListDefaultParameters,
    ])]: unwrapResult(fetchAllocatorsResult),
    [unstable_serialize([
      QueryKey.ALLOCATORS_LIST,
      metaallocatorsListDefaultParameters,
    ])]: unwrapResult(fetchMetaalloctorsResult),
    [unstable_serialize([
      QueryKey.ALLOCATORS_AUDIT_STATES,
      auditsFlowDefaultParameters,
    ])]: unwrapResult(auditsFlowResult),
    [unstable_serialize([
      QueryKey.ALLOCATORS_SPS_COMPLIANCE_DATA,
      complianceDefaultParameters,
    ])]: unwrapResult(complianceResult),
  };

  return (
    <SWRConfig
      value={{
        fallback,
      }}
    >
      <PageHeader>
        <PageTitle>Allocators</PageTitle>
        <PageSubtitle>
          Compliance dashboard and listing for Allocators
        </PageSubtitle>
      </PageHeader>
      <IdBasedStickyTabNaviation className="mb-8" tabs={sectionTabs} />
      <Container className="flex flex-col gap-y-8">
        <AllocatorsSPsComplianceWidget />
        <AllocatorsListWidget
          id={AllocatorsPageSectionId.ALLOCATORS_LIST}
          defaultParameters={allocatorsListDefaultParameters}
        />
        <MetaallocatorsListWidget
          id={AllocatorsPageSectionId.METAALLOCATORS_LIST}
          defaultParameters={metaallocatorsListDefaultParameters}
        />
        <DCFlowWidget id={AllocatorsPageSectionId.DC_FLOW} />
        <AuditsFlowWidget
          id={AllocatorsPageSectionId.AUDITS_FLOW}
          defaultParameters={auditsFlowDefaultParameters}
        />
        <AllocatorsLeaderboards
          id={AllocatorsPageSectionId.LEADERBOARDS}
          scores={allocatorScoreRanking}
        />
      </Container>
    </SWRConfig>
  );
}

function unwrapResult<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === "fulfilled" ? result.value : undefined;
}
