import { permanentRedirect } from "next/navigation";
import { AllocatorDetailsPageSectionId } from "@/lib/constants";

interface PageProps {
  params: { id: string };
}

export default function AllocatorReportsPage(props: PageProps) {
  return permanentRedirect(
    `/allocators/${props.params.id}#${AllocatorDetailsPageSectionId.REPORTS}`
  );
}
