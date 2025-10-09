import { Container } from "@/components/container";
import { PageHeader, PageSubtitle, PageTitle } from "@/components/page-header";
import { QueryKey } from "@/lib/constants";
import { generatePageMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { SWRConfig, unstable_serialize } from "swr";
import { StorageProvidersComplianceWidget } from "../components/storage-providers-compliance-widget";
import { StorageProvidersListWidget } from "../components/storage-providers-list-widget";
import {
  fetchStorageProvidersComplianceData,
  FetchStorageProvidersComplianceDataParameters,
  fetchStorageProvidersList,
} from "../storage-providers-data";

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

export default async function StorageProvidersPage() {
  const [listResult, complianceDataResult] = await Promise.allSettled([
    fetchStorageProvidersList(),
    fetchStorageProvidersComplianceData(complianceDataDefaultParams),
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
      </Container>
    </SWRConfig>
  );
}
