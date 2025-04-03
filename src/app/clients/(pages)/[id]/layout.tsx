import { FilecoinPulseButton } from "@/components/filecoin-pulse-button";
import { GithubButton } from "@/components/github-button";
import { JsonLd } from "@/components/json.ld";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveView } from "@/components/ui/responsive-view";
import { PageHeader, PageSubTitle, PageTitle } from "@/components/ui/title";
import { getClients } from "@/lib/api";
import { createClientLink } from "@/lib/filecoin-pulse";
import { convertBytesToIEC, generatePageMetadata } from "@/lib/utils";
import { Metadata } from "next";
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
      <div className="flex w-full justify-between mb-4 main-content">
        <PageHeader>
          <div className="flex items-end">
            <PageTitle>{clientData.name}</PageTitle>
            <div className="ml-4 mb-1 flex items-center gap-1">
              {!!clientData.githubUrl && (
                <GithubButton
                  url={clientData.githubUrl}
                  tooltipText="View application on GitHub"
                />
              )}
              <FilecoinPulseButton url={createClientLink(params.id)} />
            </div>
          </div>
          <PageSubTitle>Client ID: {params.id}</PageSubTitle>
        </PageHeader>
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
      <Suspense>{children}</Suspense>
    </JsonLd>
  );
}
