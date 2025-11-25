import { ClientDetailsPageSectionId } from "@/lib/constants";
import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export default function ClientReportsPage({ params }: PageProps) {
  permanentRedirect(
    `/clients/${params.id}#${ClientDetailsPageSectionId.REPORTS}`
  );
}
