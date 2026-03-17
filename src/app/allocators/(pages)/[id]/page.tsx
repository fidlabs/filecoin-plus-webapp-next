import { Container } from "@/components/container";
import { AllocatorVerifiedClientsWidget } from "./components/allocator-verified-clients-widget";
import { AllocatorReportsWidget } from "./components/allocator-reports-widget";
import { AllocatorDetailsPageSectionId, QueryKey } from "@/lib/constants";
import { AllocatorScoreWidget } from "./components/allocator-score-widget";
import { AllocatorAllocationsWidget } from "./components/allocator-allocations-widget";
import { SWRConfig, unstable_serialize } from "swr";
import {
  fetchAllocatorReports,
  fetchAllocatorVerifiedClients,
  FetchAllocatorVerifiedClientsParameters,
} from "../../allocators-data";
import { getAllocatorById } from "@/lib/api";

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

  const [verifiedClientResult, reportsResult, allocatorResult] =
    await Promise.allSettled([
      fetchAllocatorVerifiedClients(verifiedClientsParameters),
      fetchAllocatorReports({ allocatorId }),
      getAllocatorById(allocatorId),
    ]);

  const fallback = {
    [unstable_serialize([
      QueryKey.ALLOCATOR_VERIFIED_CLIENTS,
      verifiedClientsParameters,
    ])]: unwrapResult(verifiedClientResult),
    [unstable_serialize([QueryKey.ALLOCATOR_REPORTS, allocatorId])]:
      unwrapResult(reportsResult),
    [unstable_serialize([QueryKey.ALLOCATOR_BY_ID, allocatorId])]:
      unwrapResult(allocatorResult),
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
