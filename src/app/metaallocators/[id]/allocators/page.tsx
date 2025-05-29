import { getAllocators } from "@/lib/api";
import { MetaallocatorAllocatorsList } from "./components/metaallocator-allocators-list";

export const revalidate = 300;

interface Props {
  params: { id: string };
  searchParams: Record<string, string | undefined>;
}

const defaultParams: Record<string, string> = {
  page: "1",
  limit: "10",
  showInactive: "false",
};

export default async function MetaallocatorAllocatorsPage({
  params,
  searchParams,
}: Props) {
  const allocatorsResponse = await getAllocators({
    ...defaultParams,
    ...searchParams,
    usingMetaallocator: params.id,
  });

  return <MetaallocatorAllocatorsList allocatorsReponse={allocatorsResponse} />;
}
