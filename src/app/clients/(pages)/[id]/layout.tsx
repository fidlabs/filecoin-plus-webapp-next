import { FilecoinPulseButton } from "@/components/filecoin-pulse-button";
import { GithubButton } from "@/components/github-button";
import { JsonLd } from "@/components/json.ld";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardGrid } from "@/components/ui/card-grid";
import { PageHeader, PageSubTitle, PageTitle } from "@/components/ui/header";
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

  return {
    id: client.addressId,
    name: client.name,
    remainingDatacap: client.remainingDatacap,
    allocatedDatacap: client.initialAllowance,
    githubUrl: client.allowanceArray?.[0]?.auditTrail,
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
        leftContent={
          <>
            <PageTitle>
              <ClientLink clientId={params.id}>{clientData.name}</ClientLink>
            </PageTitle>
            <PageSubTitle>
              Client ID:{" "}
              <ClientLink clientId={params.id}>{params.id}</ClientLink>
            </PageSubTitle>
            <ActionButtons clientData={clientData} params={params.id} />
          </>
        }
        rightContent={<CardContainer clientData={clientData} />}
      />
      <Suspense>{children}</Suspense>
    </JsonLd>
  );
}

function CardContainer({ clientData }: { clientData: ClientData }) {
  return (
      <ResponsiveView>
        <CardGrid cols="col-2">
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
        </CardGrid>
      </ResponsiveView>
  );
}

function ActionButtons({
  clientData,
  params,
}: {
  clientData: ClientData;
  params: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {!!clientData.githubUrl && (
        <GithubButton url={clientData.githubUrl}>
          <span className="lg:hidden">GitHub</span>
          <span className="hidden lg:inline">View on GitHub</span>
        </GithubButton>
      )}
      <FilecoinPulseButton url={createClientLink(params)}>
        <span className="lg:hidden">Pulse</span>
        <span className="hidden lg:inline">View on Filecoin Pulse</span>
      </FilecoinPulseButton>
    </div>
  );
}
