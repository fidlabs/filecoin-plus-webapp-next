import { FilecoinPulseButton } from "@/components/filecoin-pulse-button";
import { GithubButton } from "@/components/github-button";
import { JsonLd } from "@/components/json.ld";
import { PageHeader, PageSubtitle, PageTitle } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveView } from "@/components/ui/responsive-view";
import { getClients } from "@/lib/api";
import { createClientLink } from "@/lib/filecoin-pulse";
import { convertBytesToIEC, generatePageMetadata } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cache, PropsWithChildren, Suspense } from "react";
import { Person, WithContext } from "schema-dts";

interface ClientData {
  id: string;
  name: string;
  remainingDatacap: string;
  allocatedDatacap: string;
  githubUrl: string | null | undefined;
}

async function fetchClientData(clientId: string): Promise<ClientData | null> {
  const response = await getClients({ filter: clientId });
  const client = response.data[0];

  if (!client) {
    return null;
  }

  const githubUrl = client.allowanceArray.find((entry) => {
    return typeof entry.auditTrail === "string";
  })?.auditTrail;

  return {
    id: client.addressId,
    name: client.name,
    remainingDatacap: client.remainingDatacap,
    allocatedDatacap: client.initialAllowance,
    githubUrl,
  };
}

const fetchClientDataCached = cache(fetchClientData);

interface IPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: IPageProps): Promise<Metadata> {
  const { id } = params;

  const clientResponse = await fetchClientDataCached(id);

  if (!clientResponse) {
    return {
      title: "404",
    };
  }
  return generatePageMetadata({
    title: `Fil+ DataCap Stats | ${clientResponse.name}`,
    description: "Fil+ Client",
    url: `https://datacapstats.io/clients/${id}`,
  });
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

export default async function ClientDetailsLayout({
  children,
  params,
}: PropsWithChildren<IPageProps>) {
  const clientData = await fetchClientDataCached(params.id);

  if (!clientData) {
    redirect("/404");
  }

  const person: WithContext<Person> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: clientData.name,
    description: "Fil+ Client",
    url: `https://datacapstats.io/clients/${params.id}`,
  };

  return (
    <JsonLd data={person}>
      <PageHeader
        className="mb-4"
        containerProps={{
          className: "flex justify-between",
        }}
      >
        <div>
          <PageTitle className="truncate">
            <ClientLink clientId={params.id}>
              {clientData.name ?? clientData.id}
            </ClientLink>
          </PageTitle>
          <PageSubtitle className="mb-4">
            Client ID: <ClientLink clientId={params.id}>{params.id}</ClientLink>
          </PageSubtitle>
          <div className="flex items-center gap-2">
            {!!clientData.githubUrl && (
              <GithubButton url={clientData.githubUrl}>
                <span className="lg:hidden">GitHub</span>
                <span className="hidden lg:inline">
                  View application on GitHub
                </span>
              </GithubButton>
            )}
            <FilecoinPulseButton url={createClientLink(params.id)}>
              <span className="lg:hidden">Pulse</span>
              <span className="hidden lg:inline">View on Filecoin Pulse</span>
            </FilecoinPulseButton>
          </div>
        </div>
        <div className="min-w-[40px] md:min-w-fit flex justify-center">
          <ResponsiveView>
            <div className="grid grid-cols-2 w-full p-4 pb-10 gap-4 md:my-6 md:p-0">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle>Remaining DataCap</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {convertBytesToIEC(clientData.remainingDatacap)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle>Allocated DataCap</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {convertBytesToIEC(clientData.allocatedDatacap)}
                </CardContent>
              </Card>
            </div>
          </ResponsiveView>
        </div>
      </PageHeader>
      <Suspense>{children}</Suspense>
    </JsonLd>
  );
}
