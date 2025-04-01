import { getStorageProviderById } from "@/lib/api";
import { Metadata } from "next";
import { cache, PropsWithChildren, Suspense } from "react";
import { PageHeader, PageTitle } from "@/components/ui/title";
import { generatePageMetadata } from "@/lib/utils";
import { createStorageProviderLink } from "@/lib/filecoin-pulse";
import { FilecoinPulseButton } from "@/components/filecoin-pulse-button";

const fetchData = cache(async (id: string) => {
  return await getStorageProviderById(id, {
    page: "1",
    limit: "10",
  });
});

interface IPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: IPageProps): Promise<Metadata> {
  const { id } = params;

  const spResponse = await fetchData(id);

  if (!spResponse) {
    return {
      title: "404",
    };
  }

  return generatePageMetadata({
    title: `Fil + | Storage Provider ${spResponse.providerId}`,
    description: `Storage Provider ${spResponse.providerId} details`,
    url: `https://datacapstats.io/storage-providers/${id}`,
  });
}

const AllocatorDetailsLayout = async ({
  children,
  params,
}: PropsWithChildren<IPageProps>) => {
  const spResponse = await fetchData(params.id);

  return (
    <main className="main-content">
      <div className="flex w-full justify-between mb-4">
        <PageHeader>
          <div className="flex gap-4 items-end">
            <PageTitle>{spResponse?.providerId}</PageTitle>
            <FilecoinPulseButton
              className="mb-1"
              url={createStorageProviderLink(params.id)}
            />
          </div>
        </PageHeader>
      </div>
      <Suspense>{children}</Suspense>
    </main>
  );
};

export default AllocatorDetailsLayout;
