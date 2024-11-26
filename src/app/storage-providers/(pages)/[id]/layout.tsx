import {getStorageProviderById} from "@/lib/api";
import {Metadata, ResolvingMetadata} from "next";
import {cache, PropsWithChildren, Suspense} from "react";
import {StorageProvider} from "@/app/storage-providers/(pages)/[id]/components/storage.provider";
import {PageHeader, PageTitle} from "@/components/ui/title";

const fetchData = cache(async (id: string) => {
  return await getStorageProviderById(id, {
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

  const spResponse = await fetchData(id)

  if (!spResponse) {
    return {
      title: '404'
    }
  }

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: `Fil + | Storage Provider ${spResponse.providerId}`,
    openGraph: {
      images: [...previousImages],
    },
  }
}

const AllocatorDetailsLayout = async ({children, params}: PropsWithChildren<IPageProps>) => {
  const spResponse = await fetchData(params.id)

  return <main className="main-content">
    <StorageProvider id={params.id} initialData={spResponse}>
      <div className="flex w-full justify-between mb-4">
        <PageHeader>
          <PageTitle>
            {spResponse?.providerId}
          </PageTitle>
        </PageHeader>
      </div>
      <Suspense>
        {children}
      </Suspense>
    </StorageProvider>
  </main>
}

export default AllocatorDetailsLayout;