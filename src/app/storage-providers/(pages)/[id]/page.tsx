import { ClientsList } from "@/app/storage-providers/(pages)/[id]/components/clients-list";
import { getStorageProviderById } from "@/lib/api";
import { QueryKey } from "@/lib/constants";
import { SWRConfig, unstable_serialize } from "swr";
import { fetchStorageProviderFilscanInfo } from "../../storage-providers-data";
import { StorageProviderBalanceWidget } from "./components/storage-provider-balance-widget";
import { StorageProviderPowerWidget } from "./components/storage-provider-power-widget";

export const revalidate = 1800;

interface PageProps {
  params: { id: string };
}

const clientsListDefaultParams = { page: 1, limit: 10, filter: "" };

function unwrapResult<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === "fulfilled" ? result.value : undefined;
}

export default async function StorageProviderDetailsPage({
  params,
}: PageProps) {
  const storageProviderId = params.id;

  const [filscanInfoResult, clientsListResult] = await Promise.allSettled([
    fetchStorageProviderFilscanInfo({ storageProviderId }),
    getStorageProviderById(storageProviderId, clientsListDefaultParams),
  ]);

  const fallback = {
    [unstable_serialize([
      QueryKey.STORAGE_PROVIDER_FILSCAN_INFO,
      storageProviderId,
    ])]: unwrapResult(filscanInfoResult),
    [unstable_serialize([
      QueryKey.STORAGE_PROVIDER_BY_ID,
      storageProviderId,
      clientsListDefaultParams,
    ])]: unwrapResult(clientsListResult),
  };

  return (
    <SWRConfig value={fallback}>
      <div className="flex flex-col gap-8">
        <div className="grid gap-x-4 gap-y-8 xl:grid-cols-2">
          <StorageProviderBalanceWidget storageProviderId={storageProviderId} />
          <StorageProviderPowerWidget storageProviderId={storageProviderId} />
        </div>

        {clientsListResult.status === "fulfilled" && (
          <ClientsList id={storageProviderId} />
        )}
      </div>
    </SWRConfig>
  );
}
