import {Metadata} from "next";
import {Suspense} from "react";
import {AllocatorsCompliance} from "@/app/allocators/(pages)/compliance/components/allocators-compliance";
import {Dataset, WithContext} from "schema-dts";
import {JsonLd} from "@/components/json.ld";

export const metadata: Metadata = {
  title: "Fil+ DataCap Stats | Allocators compliance",
  description: "Fil+ DataCap Stats | Allocators compliance",
}

const dataset: WithContext<Dataset>[] = [
  { // Allocator Retrievability Score
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Fil+ DataCap Stats | Allocator's Provider's Retrievability score",
    "description": "Histogram representing the Retrievability score of the Allocator Providers",
    "url": "https://datacapstats.io/compliance-data-portal",
    "creator": {
      "@type": "Organization",
      "name": "Filecoin Incentive Design Labs",
      "url": "https://www.fidl.tech"
    },
    "distribution": {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://cdp.allocator.tech/stats/acc/allocators/retrievability"
    }
  }, { // Allocator Size Of The Biggest client allocation
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Fil+ DataCap Stats | Size Of The Biggest client allocation of Allocator",
    "description": "Histogram representing the what % of the total data cap used comes from the single client for Allocator",
    "url": "https://datacapstats.io/compliance-data-portal",
    "creator": {
      "@type": "Organization",
      "name": "Filecoin Incentive Design Labs",
      "url": "https://www.fidl.tech"
    },
    "distribution": {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://cdp.allocator.tech/stats/acc/allocators/biggest-client-distribution"
    }
  }, { // Allocator SPs Compliance
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Fil+ DataCap Stats | Compliance of Allocator's Providers",
    "description": "Histogram representing the Compliance of the Storage Providers for the Allocator",
    "url": "https://datacapstats.io/compliance-data-portal",
    "creator": {
      "@type": "Organization",
      "name": "Filecoin Incentive Design Labs",
      "url": "https://www.fidl.tech"
    },
    "distribution": {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://cdp.allocator.tech/stats/acc/allocators/sps-compliance-data"
    }
  }, { // Allocator SPs Compliance
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Fil+ DataCap Stats | Audit state of the Allocators",
    "description": "Data representing the Audit state of the Allocators",
    "url": "https://datacapstats.io/compliance-data-portal",
    "creator": {
      "@type": "Organization",
      "name": "Filecoin Incentive Design Labs",
      "url": "https://www.fidl.tech"
    },
    "distribution": {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://cdp.allocator.tech/proxy/googleapis/allocators-overview"
    }
  }, { // Allocator SPs Compliance
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Fil+ DataCap Stats | How much we trust allocators",
    "description": "Data representing the trust we have in allocators",
    "url": "https://datacapstats.io/compliance-data-portal",
    "creator": {
      "@type": "Organization",
      "name": "Filecoin Incentive Design Labs",
      "url": "https://www.fidl.tech"
    },
    "distribution": {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://cdp.allocator.tech/proxy/googleapis/allocators-overview?tab=TrustLevels-MPG"
    }
  }
]


const AllocatorsPage = () => {
  return <JsonLd data={dataset}>
    <main className="main-content ">
      <Suspense>
        <AllocatorsCompliance/>
      </Suspense>
    </main>
  </JsonLd>
};

export default AllocatorsPage;