import {getStorageProviderById} from "@/lib/api";
import {IApiQuery} from "@/lib/interfaces/api.interface";
import {Suspense} from "react";
import {ClientsList} from "@/app/storage-providers/(pages)/[id]/components/clients-list";

interface IPageProps {
  params: { id: string }
  searchParams: IApiQuery
}

const StorageProviderDetailsPage = async (pageParams: IPageProps) => {
  const currentParams = {
    page: pageParams.searchParams?.page ?? '1',
    limit: pageParams.searchParams?.limit ?? '10',
    sort: pageParams.searchParams?.sort ?? '',
  }
  const data = await getStorageProviderById(pageParams.params.id, currentParams)

  return <Suspense>
    <ClientsList data={data} params={currentParams} id={pageParams.params.id}/>
  </Suspense>

}

export default StorageProviderDetailsPage