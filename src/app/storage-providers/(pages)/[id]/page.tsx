import { ClientsList } from "@/app/storage-providers/(pages)/[id]/components/clients-list";
import { getStorageProviderById } from "@/lib/api";
import { QueryKey, StorageProviderDetailsPageSectionId } from "@/lib/constants";
import { SWRConfig, unstable_serialize } from "swr";
import {
  fetchStorageProviderFilscanInfo,
  fetchStorageProviderRpaMetricHistogram,
  type FetchStorageProviderRpaMetricHistogramParameters,
} from "../../storage-providers-data";
import { StorageProviderBalanceWidget } from "./components/storage-provider-balance-widget";
import { StorageProviderPowerWidget } from "./components/storage-provider-power-widget";
import { StorageProviderRPAMetricWidget } from "./components/storage-provider-rpa-metric-widget";

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

  const rpaParams: FetchStorageProviderRpaMetricHistogramParameters = {
    provider: storageProviderId,
    metricType: "RPA_RETRIEVABILITY",
  };

  const ttfbParams: FetchStorageProviderRpaMetricHistogramParameters = {
    provider: storageProviderId,
    metricType: "TTFB",
  };

  const bandwidthParams: FetchStorageProviderRpaMetricHistogramParameters = {
    provider: storageProviderId,
    metricType: "BANDWIDTH",
  };

  const [
    filscanInfoResult,
    clientsListResult,
    rpaResult,
    ttfbResult,
    bandwidthResult,
  ] = await Promise.allSettled([
    fetchStorageProviderFilscanInfo({ storageProviderId }),
    getStorageProviderById(storageProviderId, clientsListDefaultParams),
    fetchStorageProviderRpaMetricHistogram(rpaParams),
    fetchStorageProviderRpaMetricHistogram(ttfbParams),
    fetchStorageProviderRpaMetricHistogram(bandwidthParams),
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
    [unstable_serialize([
      QueryKey.STORAGE_PROVIDER_RPA_METRIC_HISTOGRAM,
      rpaParams,
    ])]: unwrapResult(rpaResult),
    [unstable_serialize([
      QueryKey.STORAGE_PROVIDER_RPA_METRIC_HISTOGRAM,
      ttfbParams,
    ])]: unwrapResult(ttfbResult),
    [unstable_serialize([
      QueryKey.STORAGE_PROVIDER_RPA_METRIC_HISTOGRAM,
      bandwidthParams,
    ])]: unwrapResult(bandwidthResult),
  };

  return (
    <SWRConfig value={fallback}>
      <div className="flex flex-col gap-8">
        <div
          id={StorageProviderDetailsPageSectionId.STATS}
          className="grid gap-x-4 gap-y-8 xl:grid-cols-2"
        >
          <StorageProviderBalanceWidget storageProviderId={storageProviderId} />
          <StorageProviderPowerWidget storageProviderId={storageProviderId} />
        </div>

        {clientsListResult.status === "fulfilled" && (
          <ClientsList
            id={StorageProviderDetailsPageSectionId.CLIENTS}
            providerId={storageProviderId}
          />
        )}

        <StorageProviderRPAMetricWidget
          id={StorageProviderDetailsPageSectionId.RETRIEVABILITY}
          provider={storageProviderId}
          chartType="rpa"
        />

        <StorageProviderRPAMetricWidget
          id={StorageProviderDetailsPageSectionId.TTFB}
          provider={storageProviderId}
          chartType="ttfb"
        />

        <StorageProviderRPAMetricWidget
          id={StorageProviderDetailsPageSectionId.BANDWIDTH}
          provider={storageProviderId}
          chartType="bandwidth"
        />
      </div>
    </SWRConfig>
  );
}
