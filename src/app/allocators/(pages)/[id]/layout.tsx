import {getAllocatorById} from "@/lib/api";
import {Metadata} from "next";
import {cache, PropsWithChildren, Suspense} from "react";
import {PageHeader, PageSubTitle, PageTitle} from "@/components/ui/title";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {convertBytesToIEC, generatePageMetadata} from "@/lib/utils";
import {ResponsiveView} from "@/components/ui/responsive-view";
import {JsonLd} from "@/components/json.ld";
import {Person, WithContext} from "schema-dts";

const fetchData = cache(async (id: string) => {
  return await getAllocatorById(id, {
    limit: '1'
  })
});

interface IPageProps {
  params: { id: string }
}

export async function generateMetadata(
  {params}: IPageProps,
): Promise<Metadata> {
  const {id} = params

  const allocatorResponse = await fetchData(id);

  if (!allocatorResponse) {
    return {
      title: '404'
    }
  }

  return generatePageMetadata({
    title: `Fil+ DataCap Stats | ${allocatorResponse.name}`,
    description: 'Fil+ Allocator',
    url: `https://datacapstats.io/allocators/${id}`,
  })
}

const AllocatorDetailsLayout = async ({children, params}: PropsWithChildren<IPageProps>) => {
  const allocatorResponse = await fetchData(params.id);

  const person: WithContext<Person> = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": allocatorResponse?.name,
    "description": 'Fil+ Allocator',
    "url": `https://datacapstats.io/allocators/${params.id}`,
  }

  return <JsonLd data={person}>
    <main className="main-content">
      <div className="flex w-full justify-between mb-4">
        <PageHeader>
          <PageTitle>
            {allocatorResponse?.name}
          </PageTitle>
          <PageSubTitle>Allocator ID: {allocatorResponse?.addressId}</PageSubTitle>
        </PageHeader>
        <ResponsiveView>
          <div className="p-4 pb-10 md:my-6 md:p-0">
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Remaining DataCap</CardTitle>

              </CardHeader>
              <CardContent className="p-4 pt-0">
                {convertBytesToIEC(allocatorResponse?.remainingDatacap)}
              </CardContent>
            </Card>
          </div>
        </ResponsiveView>
      </div>
      <Suspense>
        {children}
      </Suspense>
    </main>
  </JsonLd>
}

export default AllocatorDetailsLayout;