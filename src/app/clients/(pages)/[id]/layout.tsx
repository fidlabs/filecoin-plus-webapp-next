import {getClientById} from "@/lib/api";
import {Metadata} from "next";
import {PropsWithChildren, Suspense} from "react";
import {cache} from 'react';
import {PageHeader, PageSubTitle, PageTitle} from "@/components/ui/title";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {convertBytesToIEC, generatePageMetadata} from "@/lib/utils";
import {ResponsiveView} from "@/components/ui/responsive-view";
import {Person, WithContext} from "schema-dts";
import {JsonLd} from "@/components/json.ld";

const fetchData = cache(async (id: string) => {
  return await getClientById(id, {
    page: '1',
    limit: '1',
    sort: `[["createdAt", 0]]`,
    filter: ''
  })
});

interface IPageProps {
  params: { id: string }
}

export async function generateMetadata(
  {params}: IPageProps,
): Promise<Metadata> {
  const {id} = params

  const clientResponse = await fetchData(id)

  if (!clientResponse) {
    return {
      title: '404'
    }
  }
  return generatePageMetadata({
    title: `Fil+ DataCap Stats | ${clientResponse.name}`,
    description: 'Fil+ Client',
    url: `https://datacapstats.io/clients/${id}`,
  })
}

const ClientDetailsLayout = async ({children, params}: PropsWithChildren<IPageProps>) => {
  const clientResponse = await fetchData(params.id)

  const person: WithContext<Person> = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": clientResponse?.name,
    "description": 'Fil+ Client',
    "url": `https://datacapstats.io/clients/${params.id}`,
  }

  return <JsonLd data={person}>
      <div className="flex w-full justify-between mb-4 main-content">
        <PageHeader>
          <PageTitle>
            {clientResponse?.name}
          </PageTitle>
          <PageSubTitle>Client ID: {params.id}</PageSubTitle>
        </PageHeader>
        <ResponsiveView>
          <div className="grid grid-cols-2 w-full p-4 pb-10 gap-4 md:my-6 md:p-0">
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Remaining DataCap</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {convertBytesToIEC(clientResponse?.remainingDatacap)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Allocated DataCap</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {convertBytesToIEC(clientResponse?.allocatedDatacap)}
              </CardContent>
            </Card>
          </div>
        </ResponsiveView>
      </div>
      <Suspense>
        {children}
      </Suspense>
    </JsonLd>
}

export default ClientDetailsLayout;