import { BackToTop } from "@/components/back-to-top";
import { ChartStat } from "@/components/chart-stat";
import { Container } from "@/components/container";
import { GithubButton } from "@/components/github-button";
import { JsonLd } from "@/components/json.ld";
import { PageHeader, PageSubtitle, PageTitle } from "@/components/page-header";
import {
  IdBasedStickyTabNaviation,
  IdBasedStickyTabNaviationProps,
} from "@/components/sticky-tab-navigation";
import { Card } from "@/components/ui/card";
import { ClientDetailsPageSectionId, QueryKey } from "@/lib/constants";
import { generatePageMetadata } from "@/lib/utils";
import { filesize } from "filesize";
import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";
import { Person, WithContext } from "schema-dts";
import { SWRConfig, unstable_serialize } from "swr";
import {
  fetchClientAllocations,
  fetchClientLatestClaims,
  FetchClientLatestClaimsParameters,
  fetchClientProviders,
  fetchClientReports,
  fetchClients,
} from "../clients-data";
import { ClientAllocationsWidget } from "./components/client-allocations-widget";
import { ClientLatestClaimsWidget } from "./components/client-latest-claims-widget";
import { ClientProvidersWidget } from "./components/client-providers-widget";
import { ClientReportsWidget } from "./components/client-reports-widget";

interface ClientData {
  id: string;
  name: string;
  remainingDatacap: string;
  allocatedDatacap: string;
  githubUrl: string | null | undefined;
}

interface PageProps {
  params: { id: string };
}

export const revalidate = 300;

const sectionTabs = {
  [ClientDetailsPageSectionId.LATEST_CLAIMS]: "Latest Claims",
  [ClientDetailsPageSectionId.PROVIDERS]: "Providers",
  [ClientDetailsPageSectionId.ALLOCATIONS]: "Allocations",
  [ClientDetailsPageSectionId.REPORTS]: "Reports",
} as const satisfies IdBasedStickyTabNaviationProps["tabs"];

async function fetchClientData(clientId: string): Promise<ClientData | null> {
  const response = await fetchClients({ filter: clientId });
  const client = response.data[0];

  if (!client) {
    return null;
  }

  return {
    id: client.id,
    name: client.name ?? client.id,
    remainingDatacap: client.datacapRemaining,
    allocatedDatacap: client.datacapReceived,
    githubUrl: client.githubUrl,
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = params;

  const [clientResult] = await Promise.allSettled([fetchClientData(id)]);

  if (clientResult.status === "fulfilled" && clientResult.value === null) {
    return {
      title: "404",
    };
  }

  const name =
    clientResult.status === "fulfilled" ? clientResult.value?.name : undefined;

  return generatePageMetadata({
    title: `Fil+ DataCap Stats | ${name ?? id}`,
    description: "Fil+ Client",
    url: `https://datacapstats.io/clients/${id}`,
  });
}

export default async function ClientDetailsPage(pageParams: PageProps) {
  const clientId = pageParams.params.id;

  const latestClaimsDefaultParameters: FetchClientLatestClaimsParameters = {
    clientId,
    page: 1,
    limit: 15,
    filter: undefined,
    sort: "createdAt",
    order: "desc",
  };

  const [
    clientResult,
    latestClaimsResult,
    providersResult,
    allocationsResult,
    reportsResult,
  ] = await Promise.allSettled([
    fetchClientData(clientId),
    fetchClientLatestClaims(latestClaimsDefaultParameters),
    fetchClientProviders({ clientId }),
    fetchClientAllocations({ clientId }),
    fetchClientReports({ clientId }),
  ]);

  if (clientResult.status === "fulfilled" && clientResult.value === null) {
    return redirect("/404");
  }

  const clientData = unwrapResult(clientResult);
  const fallback = {
    [unstable_serialize([
      QueryKey.CLIENT_LATEST_CLAIMS,
      latestClaimsDefaultParameters,
    ])]: unwrapResult(latestClaimsResult),
    [unstable_serialize([QueryKey.CLIENT_PROVIDERS, { clientId }])]:
      unwrapResult(providersResult),
    [unstable_serialize([QueryKey.CLIENT_ALLOCATIONS, { clientId }])]:
      unwrapResult(allocationsResult),
    [unstable_serialize([QueryKey.CLIENT_REPORTS, { clientId }])]:
      unwrapResult(reportsResult),
  };

  const person: WithContext<Person> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: clientData?.name ?? clientId,
    description: "Fil+ Client",
    url: `https://datacapstats.io/clients/${clientId}`,
  };

  return (
    <JsonLd data={person}>
      <PageHeader>
        <PageTitle className="truncate">
          <ClientLink clientId={clientId}>
            {!!clientData && !!clientData.name && clientData.name !== ""
              ? clientData.name
              : clientId}
          </ClientLink>
        </PageTitle>
        <PageSubtitle className="mb-8">
          Client ID: <ClientLink clientId={clientId}>{clientId}</ClientLink>
        </PageSubtitle>
        <div className="flex items-center gap-2">
          {!!clientData && !!clientData.githubUrl && (
            <GithubButton url={clientData.githubUrl}>
              <span className="lg:hidden">GitHub</span>
              <span className="hidden lg:inline">
                View application on GitHub
              </span>
            </GithubButton>
          )}
        </div>
      </PageHeader>
      <IdBasedStickyTabNaviation className="mb-8" tabs={sectionTabs} />
      <Container className="flex flex-col gap-8">
        {!!clientData && (
          <div className="flex flex-wrap gap-4">
            <Card className="p-4 flex-1">
              <ChartStat
                label="Allocated DataCap"
                value={filesize(clientData.allocatedDatacap, {
                  standard: "iec",
                })}
              />
            </Card>
            <Card className="p-4 flex-1">
              <ChartStat
                label="Remaining DataCap"
                value={filesize(clientData.remainingDatacap, {
                  standard: "iec",
                })}
              />
            </Card>
          </div>
        )}

        <SWRConfig
          value={{
            fallback,
          }}
        >
          <ClientLatestClaimsWidget
            id={ClientDetailsPageSectionId.LATEST_CLAIMS}
            initialParameters={latestClaimsDefaultParameters}
          />
          <ClientProvidersWidget
            id={ClientDetailsPageSectionId.PROVIDERS}
            clientId={clientId}
          />
          <ClientAllocationsWidget
            id={ClientDetailsPageSectionId.ALLOCATIONS}
            clientId={clientId}
          />
          <ClientReportsWidget
            id={ClientDetailsPageSectionId.REPORTS}
            clientId={clientId}
          />
        </SWRConfig>
      </Container>
      <BackToTop />
    </JsonLd>
  );
}

function ClientLink({
  children,
  clientId,
}: PropsWithChildren<{ clientId: string }>) {
  return (
    <Link className="hover:underline" href={`/clients/${clientId}`}>
      {children}
    </Link>
  );
}

function unwrapResult<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === "fulfilled" ? result.value : undefined;
}
