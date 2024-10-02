import {getClientById} from "@/lib/api";
import {Metadata, ResolvingMetadata} from "next";
import {PropsWithChildren, Suspense} from "react";
import {ClientProvider} from "@/app/clients/(pages)/[id]/components/client.provider";
import {cache} from 'react';
import {PageHeader, PageSubTitle, PageTitle} from "@/components/ui/title";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {convertBytesToIEC} from "@/lib/utils";
import {ResponsiveView} from "@/components/ui/responsive-view";

const fetchData = cache(async (id: string) => {
  return await getClientById(id, {
    page: '1',
    limit: '10'
  })
});

interface IPageProps {
  params: { id: string }
}

export async function generateMetadata(
  {params}: IPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const {id} = params

  const clientResponse = await fetchData(id)

  if (!clientResponse) {
    return {
      title: '404'
    }
  }

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: `Fil + | Client ${clientResponse.name}`,
    openGraph: {
      images: [...previousImages],
    },
  }
}

const ClientDetailsLayout = async ({children, params}: PropsWithChildren<IPageProps>) => {
  const clientResponse = await fetchData(params.id)

  return <ClientProvider id={params.id} initialData={clientResponse}>
    <div className="flex w-full justify-between mb-4">
      <PageHeader>
        <PageTitle>
          {clientResponse?.name}
        </PageTitle>
        <PageSubTitle>Client ID: {params.id}</PageSubTitle>
      </PageHeader>
      <ResponsiveView>
        <div className="grid grid-cols-2 w-full p-4 pb-20 gap-4 md:my-6 md:p-0">
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
  </ClientProvider>
}

export default ClientDetailsLayout;