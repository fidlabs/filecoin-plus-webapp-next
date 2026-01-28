import { Container } from "@/components/container";
import { JsonLd } from "@/components/json.ld";
import { PageHeader, PageSubtitle, PageTitle } from "@/components/page-header";
import {
  IdBasedStickyTabNaviation,
  type IdBasedStickyTabNaviationProps,
} from "@/components/sticky-tab-navigation";
import { ClientsPageSectionId, QueryKey } from "@/lib/constants";
import { generatePageMetadata } from "@/lib/utils";
import { type Metadata } from "next";
import { type ItemList, type WithContext } from "schema-dts";
import { SWRConfig, unstable_serialize } from "swr";
import {
  fetchClients,
  fetchClientsDashboardStatistics,
  type FetchClientsDashboardStatisticsParameters,
  type FetchClientsParameters,
} from "./clients-data";
import { ClientsListWidget } from "./components/clients-list-widget";
import { ClientsOldDatacapWidget } from "./components/clients-old-datacap-widget";
import { ClientsStatisticsWidget } from "./components/clients-statistics-widget";

export const revalidate = 300;
export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Clients",
  description:
    "A convenient way to browse and search for Filecoin Plus Clients.",
  url: "https://datacapstats.io/clients",
});

const sectionTabs = {
  [ClientsPageSectionId.STATS]: "Stats",
  [ClientsPageSectionId.LIST]: "List",
  [ClientsPageSectionId.OLD_DATACAP]: "Old Datacap",
} as const satisfies IdBasedStickyTabNaviationProps["tabs"];

const statisticsDefaultParams: FetchClientsDashboardStatisticsParameters = {
  interval: "day",
};

const fetchClientsDefaultParameters: FetchClientsParameters = {
  page: 1,
  limit: 10,
  filter: undefined,
  sort: undefined,
};

export default async function ClientsPage() {
  const [statisticsResult, fetchClientsResult] = await Promise.allSettled([
    fetchClientsDashboardStatistics(statisticsDefaultParams),
    fetchClients(fetchClientsDefaultParameters),
  ]);

  const fallback = {
    [unstable_serialize([
      QueryKey.CLIENTS_DASHBOARD_STATISTICS,
      statisticsDefaultParams,
    ])]: unwrapResult(statisticsResult),
    [unstable_serialize([
      QueryKey.CLIENTS_LIST,
      fetchClientsDefaultParameters,
    ])]: unwrapResult(fetchClientsResult),
  };

  const listJsonLD: WithContext<ItemList> = {
    "@context": "https://schema.org",
    name: "Clients",
    "@type": "ItemList",
    itemListElement:
      fetchClientsResult.status === "fulfilled"
        ? fetchClientsResult.value.data.map((client, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@id": `https://datacapstats.io/clients/${client.id}`,
              name: client.name,
            },
          }))
        : undefined,
  };

  return (
    <SWRConfig
      value={{
        fallback,
      }}
    >
      <JsonLd data={listJsonLD}>
        <PageHeader>
          <PageTitle>Clients</PageTitle>
          <PageSubtitle>
            View all clients participating in Filecoin
          </PageSubtitle>
        </PageHeader>
        <IdBasedStickyTabNaviation className="mb-8" tabs={sectionTabs} />
        <Container className="flex flex-col gap-8">
          <ClientsStatisticsWidget id={ClientsPageSectionId.STATS} />

          <ClientsListWidget
            id={ClientsPageSectionId.LIST}
            defaultParameters={fetchClientsDefaultParameters}
          />

          <ClientsOldDatacapWidget id={ClientsPageSectionId.OLD_DATACAP} />
        </Container>
      </JsonLd>
    </SWRConfig>
  );
}

function unwrapResult<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === "fulfilled" ? result.value : undefined;
}
