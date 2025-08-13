import { Navigation } from "@/app/compliance-data-portal/components/navigation";
import { JsonLd } from "@/components/json.ld";
import { PageTitle } from "@/components/ui/title";
import { CdpProvider } from "@/lib/providers/cdp.provider";
import { EditionRoundProvider } from "@/lib/providers/edition-round-provider";
import { generatePageMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { ReactNode } from "react";
import { Dataset, WithContext } from "schema-dts";
import { EditionRoundSelect } from "./components/edition-round-select";

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Compliance Overview",
  description: "Fil+ DataCap Stats | Compliance Overview",
  url: "https://datacapstats.io/compliance-data-portal",
});

export const revalidate = 300; // 5 minutes

const dataset: WithContext<Dataset>[] = [
  {
    // SP Retrievability Score
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Fil+ DataCap Stats | Storage Provider's Retrievability score",
    description:
      "Storage Provider's Retrievability score presented as a weekly histogram",
    url: "https://datacapstats.io/compliance-data-portal",
    creator: {
      "@type": "Organization",
      name: "Filecoin Incentive Design Labs",
      url: "https://www.fidl.tech",
    },
  },
  {
    // SP Number of allocations
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Fil+ DataCap Stats | Storage Provider's number of Allocations",
    description:
      "Number Storage Provider's clients presented as a weekly histogram",
    url: "https://datacapstats.io/compliance-data-portal",
    creator: {
      "@type": "Organization",
      name: "Filecoin Incentive Design Labs",
      url: "https://www.fidl.tech",
    },
  },
  {
    // SP Size Of The Biggest client allocation
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Fil+ DataCap Stats | Storage Provider's biggest allocation",
    description:
      "Histogram representing what % of the total data cap used comes from the single client of Storage Provider",
    url: "https://datacapstats.io/compliance-data-portal",
    creator: {
      "@type": "Organization",
      name: "Filecoin Incentive Design Labs",
      url: "https://www.fild.tech",
    },
  },
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

const ComplianceLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <JsonLd data={dataset}>
      <main className="main-content flex flex-col justify-start gap-8 row-start-2 items-start">
        <CdpProvider>
          <PageTitle>Compliance overview</PageTitle>
          <div className="mt-9 flex gap-5 w-full">
            <Navigation />
            <div className="flex-1">
              <EditionRoundProvider>
                <div>
                  <EditionRoundSelect />
                  {children}
                </div>
              </EditionRoundProvider>
            </div>
          </div>
        </CdpProvider>
      </main>
    </JsonLd>
  );
};

export default ComplianceLayout;
