import { FilecoinPulseButton } from "@/components/filecoin-pulse-button";
import { GithubButton } from "@/components/github-button";
import { JsonLd } from "@/components/json.ld";
import { PageHeader, PageSubtitle, PageTitle } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveView } from "@/components/ui/responsive-view";
import { getAllocatorById, getAllocators } from "@/lib/api";
import { createAllocatorLink } from "@/lib/filecoin-pulse";
import { convertBytesToIEC, generatePageMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { cache, PropsWithChildren, Suspense } from "react";
import { Person, WithContext } from "schema-dts";

async function fetchJsonUrl(id: string): Promise<string | null> {
  const allocatorsResponse = await getAllocators({
    filter: id,
  });
  const allocator = allocatorsResponse.data.at(0);
  return allocator ? allocator.applicationJsonUrl : null;
}

const fetchData = cache(async (id: string) => {
  return await getAllocatorById(id, {
    limit: "1",
  });
});

interface IPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: IPageProps): Promise<Metadata> {
  const { id } = params;

  const allocatorResponse = await fetchData(id);

  if (!allocatorResponse) {
    return {
      title: "404",
    };
  }

  return generatePageMetadata({
    title: `Fil+ DataCap Stats | ${allocatorResponse.name}`,
    description: "Fil+ Allocator",
    url: `https://datacapstats.io/allocators/${id}`,
  });
}

const AllocatorDetailsLayout = async ({
  children,
  params,
}: PropsWithChildren<IPageProps>) => {
  const [allocatorResponse, jsonUrl] = await Promise.all([
    fetchData(params.id),
    fetchJsonUrl(params.id),
  ]);

  const person: WithContext<Person> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: allocatorResponse?.name ?? params.id,
    description: "Fil+ Allocator",
    url: `https://datacapstats.io/allocators/${params.id}`,
  };

  return (
    <JsonLd data={person}>
      <main>
        <PageHeader
          className="mb-8"
          containerProps={{
            className: "flex w-full justify-between",
          }}
        >
          <div>
            <PageTitle>
              {allocatorResponse.name && allocatorResponse.name.length > 0
                ? allocatorResponse.name
                : allocatorResponse.addressId}
            </PageTitle>
            <PageSubtitle className="mb-4">
              Allocator ID: {allocatorResponse?.addressId}
            </PageSubtitle>
            <div className="flex items-center gap-2">
              <FilecoinPulseButton url={createAllocatorLink(params.id)}>
                <span className="lg:hidden">Pulse</span>
                <span className="hidden lg:inline">View on Filecoin Pulse</span>
              </FilecoinPulseButton>
              {jsonUrl != null && (
                <GithubButton className="mb-1" url={jsonUrl}>
                  <span className="lg:hidden">GitHub</span>
                  <span className="hidden lg:inline">
                    View Registry JSON File
                  </span>
                </GithubButton>
              )}
            </div>
          </div>
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
        </PageHeader>
        <Suspense>{children}</Suspense>
      </main>
    </JsonLd>
  );
};

export default AllocatorDetailsLayout;
