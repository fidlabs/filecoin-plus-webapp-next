import { getAllocators } from "@/lib/api";
import { MetaallocatorAllocatorsList } from "./components/metaallocator-allocators-list";

export const revalidate = 300;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

const defaultParams: Record<string, string> = {
  page: "1",
  limit: "10",
  showInactive: "false",
};

export default async function MetaallocatorAllocatorsPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const allocatorsResponse = await getAllocators({
    ...defaultParams,
    ...searchParams,
    usingMetaallocator: params.id,
  });

  return <MetaallocatorAllocatorsList allocatorsReponse={allocatorsResponse} />;
}
