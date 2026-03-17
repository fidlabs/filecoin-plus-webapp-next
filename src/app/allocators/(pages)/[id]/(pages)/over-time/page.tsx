import { AllocatorDetailsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export default function AllocatorOverTimeDetailsPage(props: PageProps) {
  return permanentRedirect(
    `/allocators/${props.params.id}#${AllocatorDetailsPageSectionId.ALLOCATIONS}`
  );
}
