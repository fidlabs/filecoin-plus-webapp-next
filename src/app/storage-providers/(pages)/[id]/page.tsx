import { ClientsList } from "@/app/storage-providers/(pages)/[id]/components/clients-list";
import { getStorageProviderById } from "@/lib/api";
import { type IApiQuery } from "@/lib/interfaces/api.interface";
import { StorageProviderBalanceWidget } from "./components/storage-provider-balance-widget";
import { StorageProviderPowerWidget } from "./components/storage-provider-power-widget";
import { fetchStorageProviderFilscanInfo } from "../../storage-providers-data";
import { SWRConfig, unstable_serialize } from "swr";
import { QueryKey } from "@/lib/constants";

export const revalidate = 1800;

interface PageProps {
  params: { id: string };
  searchParams: IApiQuery;
}

function unwrapResult<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === "fulfilled" ? result.value : undefined;
}

export default async function StorageProviderDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const storageProviderId = params.id;

  const currentParams = {
    page: searchParams?.page ?? "1",
    limit: searchParams?.limit ?? "10",
    sort: searchParams?.sort ?? "",
    filter: searchParams?.filter ?? "",
  };

  const [filscanInfoResult, clientsListResult] = await Promise.allSettled([
    fetchStorageProviderFilscanInfo({ storageProviderId }),
    getStorageProviderById(storageProviderId, currentParams),
  ]);

  const fallback = {
    [unstable_serialize([
      QueryKey.STORAGE_PROVIDER_FILSCAN_INFO,
      storageProviderId,
    ])]: unwrapResult(filscanInfoResult),
  };

  return (
    <SWRConfig value={fallback}>
      <div className="flex flex-col gap-8">
        <div className="grid gap-x-4 gap-y-8 xl:grid-cols-2">
          <StorageProviderBalanceWidget storageProviderId={storageProviderId} />
          <StorageProviderPowerWidget storageProviderId={storageProviderId} />
        </div>

        {clientsListResult.status === "fulfilled" && (
          <ClientsList
            data={clientsListResult.value}
            params={currentParams}
            id={storageProviderId}
          />
        )}
      </div>
    </SWRConfig>
  );
}
