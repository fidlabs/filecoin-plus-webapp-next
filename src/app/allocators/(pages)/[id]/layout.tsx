import { FilecoinPulseButton } from "@/components/filecoin-pulse-button";
import { GithubButton } from "@/components/github-button";
import { JsonLd } from "@/components/json.ld";
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
  return allocator ? allocator.application_json_url : null;
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
    name: allocatorResponse?.name,
    description: "Fil+ Allocator",
    url: `https://datacapstats.io/allocators/${params.id}`,
  };

  return (
    <JsonLd data={person}>
      <main>
        <div className="main-content flex w-full justify-between mb-4">
          <div className="text-white">
            <h1 className="text-3xl leading-relaxed font-semibold">
              {allocatorResponse.name.length > 0
                ? allocatorResponse.name
                : allocatorResponse.addressId}{" "}
            </h1>
            <p className="text-sm leading-none mb-4">
              Allocator ID: {allocatorResponse?.addressId}
            </p>
            <div className="flex items-center gap-2">
              <FilecoinPulseButton url={createAllocatorLink(params.id)}>
                <span className="lg:hidden">Pulse</span>
                <span className="hidden lg:inline">View on Filecoin Pulse</span>
              </FilecoinPulseButton>
              {jsonUrl !== null && (
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
        </div>
        <Suspense>{children}</Suspense>
      </main>
    </JsonLd>
  );
};

export default AllocatorDetailsLayout;
