import { Navigation } from "@/app/compliance-data-portal/components/navigation";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json.ld";
import { PageHeader, PageTitle } from "@/components/page-header";
import { CdpProvider } from "@/lib/providers/cdp.provider";
import { EditionRoundProvider } from "@/lib/providers/edition-round-provider";
import { generatePageMetadata } from "@/lib/utils";
import { type Metadata } from "next";
import { type PropsWithChildren } from "react";
import type { Dataset, WithContext } from "schema-dts";

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Compliance Overview",
  description: "Fil+ DataCap Stats | Compliance Overview",
  url: "https://datacapstats.io/compliance-data-portal",
});

export const revalidate = 300; // 5 minutes

const dataset: WithContext<Dataset>[] = [
  {
    // SP Compliance
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Fil+ DataCap Stats | Storage Provider's compliance",
    description:
      "Histogram representing the Compliance of the Storage Providers for the Allocator",
    url: "https://datacapstats.io/compliance-data-portal",
    creator: {
      "@type": "Organization",
      name: "Filecoin Incentive Design Labs",
      url: "https://www.fidl.tech",
    },
  },
  {
    // Allocator Retrievability Score
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Fil+ DataCap Stats | Allocator's Provider's Retrievability score",
    description:
      "Histogram representing the Retrievability score of the Allocator Providers",
    url: "https://datacapstats.io/compliance-data-portal",
    creator: {
      "@type": "Organization",
      name: "Filecoin Incentive Design Labs",
      url: "https://www.fidl.tech",
    },
  },
  {
    // Allocator Size Of The Biggest client allocation
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Fil+ DataCap Stats | Size Of The Biggest client allocation of Allocator",
    description:
      "Histogram representing the what % of the total data cap used comes from the single client for Allocator",
    url: "https://datacapstats.io/compliance-data-portal",
    creator: {
      "@type": "Organization",
      name: "Filecoin Incentive Design Labs",
      url: "https://www.fidl.tech",
    },
  },
  {
    // Allocator SPs Compliance
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Fil+ DataCap Stats | Compliance of Allocator's Providers",
    description:
      "Histogram representing the Compliance of the Storage Providers for the Allocator",
    url: "https://datacapstats.io/compliance-data-portal",
    creator: {
      "@type": "Organization",
      name: "Filecoin Incentive Design Labs",
      url: "https://www.fidl.tech",
    },
  },
  {
    // Allocator SPs Compliance
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Fil+ DataCap Stats | Audit State of the Allocators",
    description: "Data representing the Audit State of the Allocators",
    url: "https://datacapstats.io/compliance-data-portal",
    creator: {
      "@type": "Organization",
      name: "Filecoin Incentive Design Labs",
      url: "https://www.fidl.tech",
    },
  },
  {
    // Allocator SPs Compliance
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Fil+ DataCap Stats | How much we trust allocators",
    description: "Data representing the trust we have in allocators",
    url: "https://datacapstats.io/compliance-data-portal",
    creator: {
      "@type": "Organization",
      name: "Filecoin Incentive Design Labs",
      url: "https://www.fidl.tech",
    },
  },
];

export default function ComplianceLayout({ children }: PropsWithChildren) {
  return (
    <JsonLd data={dataset}>
      <CdpProvider>
        <main>
          <PageHeader>
            <PageTitle>
              <PageTitle>Compliance overview</PageTitle>
            </PageTitle>
          </PageHeader>
          <Container className="mt-9 flex gap-5 w-full">
            <Navigation />
            <div className="flex-1">
              <EditionRoundProvider>{children}</EditionRoundProvider>
            </div>
          </Container>
        </main>
      </CdpProvider>
    </JsonLd>
  );
}
