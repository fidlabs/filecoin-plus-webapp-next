import { permanentRedirect } from "next/navigation";
import { AllocatorDetailsPageSectionId } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AllocatorReportsPage(props: PageProps) {
  return permanentRedirect(
    `/allocators/${(await props.params).id}#${AllocatorDetailsPageSectionId.REPORTS}`
  );
}
