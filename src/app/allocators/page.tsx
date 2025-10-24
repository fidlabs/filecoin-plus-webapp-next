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
import {
  fetchAllocators,
  fetchAllocatorsAuditOutcomes,
  FetchAllocatorsAuditOutcomesParameters,
  fetchAllocatorsAuditStates,
  FetchAllocatorsAuditStatesParameters,
  fetchAllocatorsAuditTimes,
  FetchAllocatorsAuditTimesParameters,
  fetchAllocatorsClientDistributionData,
  fetchAllocatorsClientDiversityData,
  fetchAllocatorScoreRanking,
  FetchAllocatorsParameters,
  fetchAllocatorsRetrievabilityData,
  FetchAllocatorsRetrievabilityDataParameters,
  fetchAllocatorsSPsComplianceData,
  FetchAllocatorsSPsComplianceDataParameters,
} from "./allocators-data";
import { AllocatorsAuditStatesWidget } from "./components/allocators-audit-states-widget";
import { AllocatorsClientDistributionWidget } from "./components/allocators-client-distribution-widget";
import { AllocatorsClientDiversityWidget } from "./components/allocators-client-diversity-widget";
import { AllocatorsLeaderboards } from "./components/allocators-leaderboards";
import { AllocatorsListWidget } from "./components/allocators-list-widget";
import { AllocatorsRetrievabilityWidget } from "./components/allocators-retrievability-widget";
import { AllocatorsSPsComplianceWidget } from "./components/allocators-sps-compliance-widget";
import { AuditsFlowWidget } from "./components/audits-flow-widget";
import { DCFlowWidget } from "./components/dc-flow-widget";
import { MetaallocatorsListWidget } from "./components/metaallocators-list-widget";
import { AllocatorsAuditOutcomesWidget } from "./components/allocators-audit-outcomes-widget";
import { AllocatorsAuditTimesWidget } from "./components/allocators-audit-times-widget";

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
  [AllocatorsPageSectionId.RETRIEVABILITY]: "Retrievability",
  [AllocatorsPageSectionId.CLIENT_DIVERSITY]: "Client Diversity",
  [AllocatorsPageSectionId.CLIENT_DISTRIBUTION]: "Client Distribution",
  [AllocatorsPageSectionId.DC_FLOW]: "DC Flow",
  [AllocatorsPageSectionId.AUDITS_FLOW]: "Audits Flow",
  [AllocatorsPageSectionId.AUDITS_STATE]: "Audits States",
  [AllocatorsPageSectionId.AUDIT_OUTCOMES]: "Audit Outcomes",
  [AllocatorsPageSectionId.AUDIT_TIMES]: "Audit Times",
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

const retrievabilityDefaultParameters: FetchAllocatorsRetrievabilityDataParameters =
  {
    editionId: undefined,
    openDataOnly: false,
    retrievabilityType: "urlFinder",
  };

const auditOutcomesDefaultParameters: FetchAllocatorsAuditOutcomesParameters = {
  editionId: "6",
};

const auditTimesDefaultParameters: FetchAllocatorsAuditTimesParameters = {
  editionId: "6",
};

export default async function AllocatorsPage() {
  const fallbackRequests = Promise.allSettled([
    fetchAllocators(allocatorsListDefaultParameters),
    fetchAllocators(metaallocatorsListDefaultParameters),
    fetchAllocatorsAuditStates(auditsFlowDefaultParameters),
    fetchAllocatorsSPsComplianceData(complianceDefaultParameters),
    fetchAllocatorsRetrievabilityData(retrievabilityDefaultParameters),
    fetchAllocatorsClientDiversityData(),
    fetchAllocatorsClientDistributionData(),
    fetchAllocatorsAuditOutcomes(auditOutcomesDefaultParameters),
    fetchAllocatorsAuditTimes(auditTimesDefaultParameters),
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
    retrievabilityResult,
    clientDiversityResult,
    clientDistributionResult,
    auditOutcomesResult,
    auditTimesResult,
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
    [unstable_serialize([
      QueryKey.ALLOCATORS_RETRIEVABILITY,
      retrievabilityDefaultParameters,
    ])]: unwrapResult(retrievabilityResult),
    [unstable_serialize([QueryKey.ALLOCATORS_CLIENT_DIVERSITY, {}])]:
      unwrapResult(clientDiversityResult),
    [unstable_serialize([QueryKey.ALLOCATORS_CLIENT_DISTRIBUTION, {}])]:
      unwrapResult(clientDistributionResult),
    [unstable_serialize([
      QueryKey.ALLOCATORS_AUDIT_OUTCOMES,
      auditOutcomesDefaultParameters,
    ])]: unwrapResult(auditOutcomesResult),
    [unstable_serialize([
      QueryKey.ALLOCATORS_AUDIT_TIMES,
      auditsFlowDefaultParameters,
    ])]: unwrapResult(auditTimesResult),
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
        <AllocatorsSPsComplianceWidget
          id={AllocatorsPageSectionId.COMPLIANCE}
        />
        <AllocatorsListWidget
          id={AllocatorsPageSectionId.ALLOCATORS_LIST}
          defaultParameters={allocatorsListDefaultParameters}
        />
        <MetaallocatorsListWidget
          id={AllocatorsPageSectionId.METAALLOCATORS_LIST}
          defaultParameters={metaallocatorsListDefaultParameters}
        />
        <AllocatorsRetrievabilityWidget
          id={AllocatorsPageSectionId.RETRIEVABILITY}
        />
        <AllocatorsClientDiversityWidget
          id={AllocatorsPageSectionId.CLIENT_DIVERSITY}
        />
        <AllocatorsClientDistributionWidget
          id={AllocatorsPageSectionId.CLIENT_DISTRIBUTION}
        />
        <DCFlowWidget id={AllocatorsPageSectionId.DC_FLOW} />
        <AuditsFlowWidget
          id={AllocatorsPageSectionId.AUDITS_FLOW}
          defaultParameters={auditsFlowDefaultParameters}
        />
        <AllocatorsAuditStatesWidget
          id={AllocatorsPageSectionId.AUDITS_STATE}
        />
        <AllocatorsAuditOutcomesWidget
          id={AllocatorsPageSectionId.AUDIT_OUTCOMES}
        />
        <AllocatorsAuditTimesWidget id={AllocatorsPageSectionId.AUDIT_TIMES} />
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
