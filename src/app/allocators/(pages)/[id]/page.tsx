import {getAllocatorById} from "@/lib/api";
import {IApiQuery} from "@/lib/interfaces/api.interface";
import {Suspense} from "react";
import {VerifiedClientsList} from "@/app/allocators/(pages)/[id]/components/verified-clients-list";

interface IPageProps {
  params: { id: string }
  searchParams: IApiQuery
}

const AllocatorDetailsPage = async (pageParams: IPageProps) => {
  const allocatorId = pageParams.params.id
  const searchParams = pageParams.searchParams

  const currentParams = {
    page: searchParams?.page ?? '1',
    limit: searchParams?.limit ?? '10',
    filter: searchParams?.filter ?? '',
    sort: searchParams?.sort ?? '',
  }

  const data = await getAllocatorById(allocatorId, currentParams)

  return <Suspense>
      <VerifiedClientsList allocatorId={allocatorId} data={data} searchParams={currentParams}/>
    </Suspense>
}

export default AllocatorDetailsPage