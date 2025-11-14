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
  fetchAllocatorsChecksBreakdown,
  FetchAllocatorsChecksBreakdownParameters,
  fetchAllocatorsClientDistributionData,
  fetchAllocatorsClientDiversityData,
  fetchAllocatorScoreRanking,
  FetchAllocatorsParameters,
  fetchAllocatorsRetrievabilityData,
  FetchAllocatorsRetrievabilityDataParameters,
  fetchAllocatorsScoringBreakdown,
  FetchAllocatorsScoringBreakdownParameters,
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
import { AllocatorsOldDatacapWidget } from "./components/allocators-old-datacap-widget";
import { BackToTop } from "@/components/back-to-top";
import { AllocatorsChecksBreakdownWidget } from "./components/allocators-checks-breakdown-widget";
import { AllocatorsScoringBreakdownWidget } from "./components/allocators-scoring-breakdown-widget";

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
  [AllocatorsPageSectionId.SCORING_BREAKDOWN]: "Scoring Breakdown",
  [AllocatorsPageSectionId.ALERTS_BREAKDOWN]: "Alerts Breakdown",
  [AllocatorsPageSectionId.DC_FLOW]: "DC Flow",
  [AllocatorsPageSectionId.AUDITS_FLOW]: "Audits Flow",
  [AllocatorsPageSectionId.AUDITS_STATE]: "Audits States",
  [AllocatorsPageSectionId.AUDIT_OUTCOMES]: "Audit Outcomes",
  [AllocatorsPageSectionId.AUDIT_TIMES]: "Audit Times",
  [AllocatorsPageSectionId.LEADERBOARDS]: "Leaderboards",
  [AllocatorsPageSectionId.OLD_DATACAP]: "Old Datacap",
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
    httpRetrievability: true,
    urlFinderRetrievability: true,
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

const checksBreakdownDefaultParameters: FetchAllocatorsChecksBreakdownParameters =
  {
    groupBy: "week",
  };

const scoringBreakdownDefaultParameters: FetchAllocatorsScoringBreakdownParameters =
  {
    groupBy: "week",
    dataType: undefined,
    mediumScoreThreshold: 30,
    highScoreThreshold: 75,
    includeDetails: false,
  };

export default async function AllocatorsPage() {
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
    checksBreakdownResult,
    allocatorsScoreRankingResult,
    scoringBreakdownResult,
  ] = await Promise.allSettled([
    fetchAllocators(allocatorsListDefaultParameters),
    fetchAllocators(metaallocatorsListDefaultParameters),
    fetchAllocatorsAuditStates(auditsFlowDefaultParameters),
    fetchAllocatorsSPsComplianceData(complianceDefaultParameters),
    fetchAllocatorsRetrievabilityData(retrievabilityDefaultParameters),
    fetchAllocatorsClientDiversityData(),
    fetchAllocatorsClientDistributionData(),
    fetchAllocatorsAuditOutcomes(auditOutcomesDefaultParameters),
    fetchAllocatorsAuditTimes(auditTimesDefaultParameters),
    fetchAllocatorsChecksBreakdown(checksBreakdownDefaultParameters),
    fetchAllocatorScoreRanking(),
    fetchAllocatorsScoringBreakdown(scoringBreakdownDefaultParameters),
  ]);

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
    [unstable_serialize([
      QueryKey.ALLOCATORS_CHECKS_BREAKDOWN,
      checksBreakdownDefaultParameters,
    ])]: unwrapResult(checksBreakdownResult),
    [unstable_serialize([
      QueryKey.ALLOCATORS_SCORING_BREAKDOWN,
      scoringBreakdownDefaultParameters,
    ])]: unwrapResult(scoringBreakdownResult),
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
        <AllocatorsScoringBreakdownWidget
          defaultParameters={scoringBreakdownDefaultParameters}
          id={AllocatorsPageSectionId.SCORING_BREAKDOWN}
        />
        <AllocatorsChecksBreakdownWidget
          id={AllocatorsPageSectionId.ALERTS_BREAKDOWN}
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

        {allocatorsScoreRankingResult.status === "fulfilled" ? (
          <AllocatorsLeaderboards
            id={AllocatorsPageSectionId.LEADERBOARDS}
            scores={allocatorsScoreRankingResult.value}
          />
        ) : (
          <div className="py-8" id={AllocatorsPageSectionId.LEADERBOARDS}>
            <p className="text-center text-sm text-muted-foreground max-w-[400px] mx-auto">
              Could not load Allocator score rankings. Please try again later.
            </p>
          </div>
        )}

        <AllocatorsOldDatacapWidget id={AllocatorsPageSectionId.OLD_DATACAP} />

        <BackToTop />
      </Container>
    </SWRConfig>
  );
}

function unwrapResult<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === "fulfilled" ? result.value : undefined;
}
