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

export const revalidate = 300;

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Storage Providers",
  description:
    "A convenient way to browse and search for Filecoin Plus Providers.",
  url: "https://datacapstats.io/storage-providers",
});

const complianceDataDefaultParams: FetchStorageProvidersComplianceDataParameters =
  {
    editionId: undefined,
    retrievability: true,
    numberOfClients: true,
    totalDealSize: true,
  };

const retrievabilityDataDefaultParams: FetchStorageProvidersRetrievabilityDataParameters =
  {
    editionId: undefined,
    openDataOnly: false,
    retrievabilityType: "urlFinder",
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
  [StorageProvidersPageSectionId.COMPLIANCE]: "Compliance",
  [StorageProvidersPageSectionId.LIST]: "List",
  [StorageProvidersPageSectionId.RETRIEVABILITY]: "Retrievability",
  [StorageProvidersPageSectionId.CLIENT_DIVERSITY]: "Client Diversity",
  [StorageProvidersPageSectionId.CLIENT_DISTRIBUTION]: "Client Distribution",
  [StorageProvidersPageSectionId.IPNI_MISREPORTING]: "IPNI Misreporting",
} as const satisfies IdBasedStickyTabNaviationProps["tabs"];

export default async function StorageProvidersPage() {
  const [
    listResult,
    complianceDataResult,
    retrievabilityDataResult,
    clientDiversityDataResult,
    clientDistributionDataResult,
  ] = await Promise.allSettled([
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
          [unstable_serialize([QueryKey.STORAGE_PROVIDERS_LIST, {}])]:
            listResult.status === "fulfilled" ? listResult.value : undefined,
          [unstable_serialize([
            QueryKey.STORAGE_PROVIDERS_COMPLIANCE_DATA,
            complianceDataDefaultParams,
          ])]:
            complianceDataResult.status === "fulfilled"
              ? complianceDataResult.value
              : undefined,
          [unstable_serialize([
            QueryKey.STORAGE_PROVIDERS_RETRIEVABILITY_DATA,
            retrievabilityDataDefaultParams,
          ])]:
            retrievabilityDataResult.status === "fulfilled"
              ? retrievabilityDataResult.value
              : undefined,
          [unstable_serialize([
            QueryKey.STORAGE_PROVIDERS_CLIENT_DIVERSITY_DATA,
            clientDiversityDataDefaultParams,
          ])]:
            clientDiversityDataResult.status === "fulfilled"
              ? clientDiversityDataResult.value
              : undefined,
          [unstable_serialize([
            QueryKey.STORAGE_PROVIDERS_CLIENT_DISTRIBUTION_DATA,
            clientDistributionDataDefaultParams,
          ])]:
            clientDistributionDataResult.status === "fulfilled"
              ? clientDistributionDataResult.value
              : undefined,
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
      </Container>
    </SWRConfig>
  );
}
