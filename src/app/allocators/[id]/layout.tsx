import {getAllocatorById} from "@/lib/api";
import {AllocatorProvider} from "@/app/allocators/[id]/components/allocator.provider";
import {Metadata, ResolvingMetadata} from "next";
import {PropsWithChildren} from "react";

interface IPageProps {
  params: { id: string }
}

export async function generateMetadata(
  {params}: IPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const {id} = params

  const allocatorResponse = await getAllocatorById(id, {
    limit: 1
  });

  if (!allocatorResponse) {
    return {
      title: '404'
    }
  }

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: `Fil + | Allocator ${allocatorResponse.name}`,
    openGraph: {
      images: [...previousImages],
    },
  }
}

const AllocatorDetailsLayout = async ({children, params}: PropsWithChildren<IPageProps>) => {

  return <AllocatorProvider id={params.id}>
    {children}
  </AllocatorProvider>
}

export default AllocatorDetailsLayout;