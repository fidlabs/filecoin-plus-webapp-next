import { Container } from "@/components/container";
import { AllocatorDetailsPageSectionId, QueryKey } from "@/lib/constants";
import { SWRConfig, unstable_serialize } from "swr";
import {
  fetchAllocatorAllocations,
  type FetchAllocatorAllocationsParameters,
  fetchAllocatorReports,
  fetchAllocatorVerifiedClients,
  type FetchAllocatorVerifiedClientsParameters,
} from "../../allocators-data";
import { AllocatorAllocationsWidget } from "./components/allocator-allocations-widget";
import { AllocatorReportsWidget } from "./components/allocator-reports-widget";
import { AllocatorScoreWidget } from "./components/allocator-score-widget";
import { AllocatorVerifiedClientsWidget } from "./components/allocator-verified-clients-widget";

export const revalidate = 300;

interface PageProps {
  params: { id: string };
}

function unwrapResult<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === "fulfilled" ? result.value : undefined;
}

export default async function AllocatorDetailsPage(pageParams: PageProps) {
  const allocatorId = pageParams.params.id;

  const verifiedClientsParameters: FetchAllocatorVerifiedClientsParameters = {
    allocatorId,
    page: 1,
    limit: 10,
    sort: "addressId",
    order: "asc",
  };

  const allocationsParameters: FetchAllocatorAllocationsParameters = {
    allocatorId,
    showAllocations: true,
    groupBy: "week",
    showEmptyPeriods: false,
  };

  const [verifiedClientResult, reportsResult, allocationsResult] =
    await Promise.allSettled([
      fetchAllocatorVerifiedClients(verifiedClientsParameters),
      fetchAllocatorReports({ allocatorId }),
      fetchAllocatorAllocations(allocationsParameters),
    ]);

  const fallback = {
    [unstable_serialize([
      QueryKey.ALLOCATOR_VERIFIED_CLIENTS,
      verifiedClientsParameters,
    ])]: unwrapResult(verifiedClientResult),
    [unstable_serialize([QueryKey.ALLOCATOR_REPORTS, allocatorId])]:
      unwrapResult(reportsResult),
    [unstable_serialize([
      QueryKey.ALLOCATOR_ALLOCATIONS,
      allocationsParameters,
    ])]: unwrapResult(allocationsResult),
  };

  return (
    <SWRConfig value={{ fallback }}>
      <Container className="flex flex-col gap-8">
        <AllocatorVerifiedClientsWidget
          id={AllocatorDetailsPageSectionId.CLIENTS}
          allocatorId={allocatorId}
        />
        <AllocatorReportsWidget
          id={AllocatorDetailsPageSectionId.REPORTS}
          allocatorId={allocatorId}
        />
        <AllocatorScoreWidget
          id={AllocatorDetailsPageSectionId.SCORE}
          allocatorId={allocatorId}
        />
        <AllocatorAllocationsWidget
          id={AllocatorDetailsPageSectionId.ALLOCATIONS}
          allocatorId={allocatorId}
        />
      </Container>
    </SWRConfig>
  );
}
