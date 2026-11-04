import { ClientDetailsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientAllocationsPage(props: PageProps) {
  const params = await props.params;
  permanentRedirect(
    `/clients/${params.id}#${ClientDetailsPageSectionId.ALLOCATIONS}`
  );
}
