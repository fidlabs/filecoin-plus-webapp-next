import { Container } from "@/components/container";
import { PageHeader, PageSubtitle, PageTitle } from "@/components/page-header";
import { QueryKey, StorageProvidersPageSectionId } from "@/lib/constants";
import { generatePageMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { SWRConfig, unstable_serialize } from "swr";
import { StorageProvidersComplianceWidget } from "../components/storage-providers-compliance-widget";
import { StorageProvidersListWidget } from "../components/storage-providers-list-widget";
import {
  fetchStorageProvidersClientDistributionData,
  FetchStorageProvidersClientDistributionDataParameters,
  fetchStorageProvidersClientDiversityData,
  FetchStorageProvidersClientDiversityDataParameters,
  fetchStorageProvidersComplianceData,
  FetchStorageProvidersComplianceDataParameters,
  fetchStorageProvidersDashboardStatistics,
  FetchStorageProvidersDashboardStatisticsParameters,
  fetchStorageProvidersList,
  fetchStorageProvidersRetrievabilityData,
  FetchStorageProvidersRetrievabilityDataParameters,
} from "../storage-providers-data";
import { StorageProvidersRetrievabilityWidget } from "../components/storage-providers-retrievability-widget";
import { StorageProvidersClientDiversityWidget } from "../components/storage-providers-client-diversity-widget";
import { StorageProvidersClientDistributionWidget } from "../components/storage-providers-client-distributon-widget";
import { StorageProvidersIPNIMisreportingWidget } from "../components/storage-providers-ipni-misreporting-widget";
import {
  IdBasedStickyTabNaviation,
  IdBasedStickyTabNaviationProps,
} from "@/components/sticky-tab-navigation";
import { BackToTop } from "@/components/back-to-top";
import { StorageProvidersStatisticsWidget } from "../components/storage-providers-statistics-widget";

export const revalidate = 300;

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Storage Providers",
  description:
    "A convenient way to browse and search for Filecoin Plus Providers.",
  url: "https://datacapstats.io/storage-providers",
});

const statisticsDefaultParamters: FetchStorageProvidersDashboardStatisticsParameters =
  {
    interval: "day",
  };

const complianceDataDefaultParams: FetchStorageProvidersComplianceDataParameters =
  {
    editionId: undefined,
    httpRetrievability: true,
    urlFinderRetrievability: true,
    numberOfClients: true,
    totalDealSize: true,
  };

const retrievabilityDataDefaultParams: FetchStorageProvidersRetrievabilityDataParameters =
  {
    editionId: undefined,
    openDataOnly: false,
  };

const clientDiversityDataDefaultParams: FetchStorageProvidersClientDiversityDataParameters =
  {
    editionId: undefined,
  };

const clientDistributionDataDefaultParams: FetchStorageProvidersClientDistributionDataParameters =
  {
    editionId: undefined,
  };

const sectionTabs = {
  [StorageProvidersPageSectionId.STATISTICS]: "Statistics",
  [StorageProvidersPageSectionId.COMPLIANCE]: "Compliance",
  [StorageProvidersPageSectionId.LIST]: "List",
  [StorageProvidersPageSectionId.RETRIEVABILITY]: "Retrievability",
  [StorageProvidersPageSectionId.CLIENT_DIVERSITY]: "Client Diversity",
  [StorageProvidersPageSectionId.CLIENT_DISTRIBUTION]: "Client Distribution",
  [StorageProvidersPageSectionId.IPNI_MISREPORTING]: "IPNI Misreporting",
} as const satisfies IdBasedStickyTabNaviationProps["tabs"];

function unwrapResult<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === "fulfilled" ? result.value : undefined;
}

export default async function StorageProvidersPage() {
  const [
    statisticsResult,
    listResult,
    complianceDataResult,
    retrievabilityDataResult,
    clientDiversityDataResult,
    clientDistributionDataResult,
  ] = await Promise.allSettled([
    fetchStorageProvidersDashboardStatistics(statisticsDefaultParamters),
    fetchStorageProvidersList(),
    fetchStorageProvidersComplianceData(complianceDataDefaultParams),
    fetchStorageProvidersRetrievabilityData(retrievabilityDataDefaultParams),
    fetchStorageProvidersClientDiversityData(clientDiversityDataDefaultParams),
    fetchStorageProvidersClientDistributionData(
      clientDistributionDataDefaultParams
    ),
  ]);

  return (
    <SWRConfig
      value={{
        fallback: {
          [unstable_serialize([
            QueryKey.STORAGE_PROVIDERS_DASHBOARD_STATISTICS,
            statisticsDefaultParamters,
          ])]: unwrapResult(statisticsResult),
          [unstable_serialize([QueryKey.STORAGE_PROVIDERS_LIST, {}])]:
            unwrapResult(listResult),
          [unstable_serialize([
            QueryKey.STORAGE_PROVIDERS_COMPLIANCE_DATA,
            complianceDataDefaultParams,
          ])]: unwrapResult(complianceDataResult),
          [unstable_serialize([
            QueryKey.STORAGE_PROVIDERS_RETRIEVABILITY_DATA,
            retrievabilityDataDefaultParams,
          ])]: unwrapResult(retrievabilityDataResult),
          [unstable_serialize([
            QueryKey.STORAGE_PROVIDERS_CLIENT_DIVERSITY_DATA,
            clientDiversityDataDefaultParams,
          ])]: unwrapResult(clientDiversityDataResult),
          [unstable_serialize([
            QueryKey.STORAGE_PROVIDERS_CLIENT_DISTRIBUTION_DATA,
            clientDistributionDataDefaultParams,
          ])]: unwrapResult(clientDistributionDataResult),
        },
      }}
    >
      <PageHeader>
        <PageTitle>Storage Providers</PageTitle>
        <PageSubtitle>
          Compliance dashboard and listing for Storage Providers
        </PageSubtitle>
      </PageHeader>
      <IdBasedStickyTabNaviation className="mb-8" tabs={sectionTabs} />
      <Container className="flex flex-col gap-y-8">
        <StorageProvidersStatisticsWidget
          id={StorageProvidersPageSectionId.STATISTICS}
        />
        <StorageProvidersComplianceWidget
          id={StorageProvidersPageSectionId.COMPLIANCE}
        />
        <StorageProvidersListWidget id={StorageProvidersPageSectionId.LIST} />
        <StorageProvidersRetrievabilityWidget
          id={StorageProvidersPageSectionId.RETRIEVABILITY}
        />
        <StorageProvidersClientDiversityWidget
          id={StorageProvidersPageSectionId.CLIENT_DIVERSITY}
        />
        <StorageProvidersClientDistributionWidget
          id={StorageProvidersPageSectionId.CLIENT_DISTRIBUTION}
        />
        <StorageProvidersIPNIMisreportingWidget
          id={StorageProvidersPageSectionId.IPNI_MISREPORTING}
        />
        <BackToTop />
      </Container>
    </SWRConfig>
  );
}
