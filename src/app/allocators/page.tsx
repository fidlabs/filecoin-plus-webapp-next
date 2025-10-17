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
import { fetchAllocators, FetchAllocatorsParameters } from "./allocators-data";
import { MetaallocatorsListWidget } from "./components/metaallocators-list-widget";
import { DCFlowWidget } from "./components/dc-flow-widget";
import {
  fetchAllocatorsAuditStates,
  FetchAllocatorsAuditStatesParameters,
} from "@/lib/api";
import { AuditsFlowWidget } from "./components/audits-flow-widget";

export const revalidate = 300;

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Allocators",
  description: "Compliance dashboard and listing for Allocators.",
  url: "https://datacapstats.io/allocators",
});

const sectionTabs = {
  [AllocatorsPageSectionId.ALLOCATORS_LIST]: "Allocators List",
  [AllocatorsPageSectionId.METAALLOCATORS_LIST]: "Metaallocators List",
  [AllocatorsPageSectionId.DC_FLOW]: "DC Flow",
  [AllocatorsPageSectionId.AUDITS_FLOW]: "Audits Flow",
} as const satisfies IdBasedStickyTabNaviationProps["tabs"];

export const allocatorsListDefaultParameters: FetchAllocatorsParameters = {
  page: 1,
  limit: 10,
  filter: "",
  showInactive: false,
  isMetaallocator: false,
};

export const metaallocatorsListDefaultParameters: FetchAllocatorsParameters = {
  page: 1,
  limit: 10,
  filter: "",
  showInactive: true,
  isMetaallocator: true,
};

export const auditsFlowDefaultParameters: FetchAllocatorsAuditStatesParameters =
  {
    editionId: "6",
  };

export default async function AllocatorsPage() {
  const [fetchAllocatorsResult, fetchMetaalloctorsResult, auditsFlowResult] =
    await Promise.allSettled([
      fetchAllocators(allocatorsListDefaultParameters),
      fetchAllocators(metaallocatorsListDefaultParameters),
      fetchAllocatorsAuditStates(auditsFlowDefaultParameters),
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
      </Container>
    </SWRConfig>
  );
}

function unwrapResult<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === "fulfilled" ? result.value : undefined;
}
