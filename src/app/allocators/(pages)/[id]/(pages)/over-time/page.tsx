import { AllocatorDetailsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AllocatorOverTimeDetailsPage(props: PageProps) {
  return permanentRedirect(
    `/allocators/${(await props.params).id}#${AllocatorDetailsPageSectionId.ALLOCATIONS}`
  );
}
