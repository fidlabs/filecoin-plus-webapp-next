import {
  ALLOCATOR_SCORE_REPORT_ID_QUERY_KEY,
  AllocatorDetailsPageSectionId,
} from "@/lib/constants";
import { objectToURLSearchParams } from "@/lib/utils";
import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: {
    id: string;
    reportIds?: string[];
  };
}

export default async function AllocatorScorePage({ params }: PageProps) {
  const { id: allocatorId, reportIds = [] } = params;
  const searchParams = objectToURLSearchParams({
    [ALLOCATOR_SCORE_REPORT_ID_QUERY_KEY]: reportIds[0],
  });
  return permanentRedirect(
    `/allocators/${allocatorId}?${searchParams.toString()}#${AllocatorDetailsPageSectionId.SCORE}`
  );
}
