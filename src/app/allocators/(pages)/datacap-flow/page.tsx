import { AllocatorsPageSectionId } from "@/lib/constants";
import { generatePageMetadata } from "@/lib/utils";
import { type Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Datacap Flow",
  description: "Fil+ DataCap Stats | Datacap Flow",
  url: "https://datacapstats.io/allocators/datacap-flow",
});

export default async function DatacapFlowPage() {
  permanentRedirect(`/allocators#${AllocatorsPageSectionId.DC_FLOW}`);
}
