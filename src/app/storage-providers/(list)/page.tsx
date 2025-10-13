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
    retrievabilityType: "rpa",
  };

const clientDiversityDataDefaultParams: FetchStorageProvidersClientDiversityDataParameters =
  {
    editionId: undefined,
  };

const clientDistributionDataDefaultParams: FetchStorageProvidersClientDistributionDataParameters =
  {
    editionId: undefined,
  };

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
      <PageHeader className="mb-8">
        <PageTitle>Storage Providers</PageTitle>
        <PageSubtitle>
          Compliance dashboard and listing for Storage Providers
        </PageSubtitle>
      </PageHeader>
      <Container className="grid gap-y-8">
        <StorageProvidersComplianceWidget />
        <StorageProvidersListWidget />
        <StorageProvidersRetrievabilityWidget
          id={StorageProvidersPageSectionId.RETRIEVABILITY}
        />
        <StorageProvidersClientDiversityWidget
          id={StorageProvidersPageSectionId.CLIENT_DIVERSITY}
        />
        <StorageProvidersClientDistributionWidget
          id={StorageProvidersPageSectionId.CLIENT_DISTRIBUTION}
        />
      </Container>
    </SWRConfig>
  );
}
