import {getStorageProviderById} from "@/lib/api";
import {Metadata, ResolvingMetadata} from "next";
import {PropsWithChildren, Suspense} from "react";
import {StorageProvider} from "@/app/storage-providers/[id]/components/storage.provider";

interface IPageProps {
  params: { id: string }
}

export async function generateMetadata(
  {params}: IPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const {id} = params

  const spResponse = await getStorageProviderById(id, {
    limit: '1'
  });

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

  return <StorageProvider id={params.id}>
    <Suspense>
      {children}
    </Suspense>
  </StorageProvider>
}

export default AllocatorDetailsLayout;