import { GenericContentHeader } from "@/components/generic-content-view";
import { JsonLd } from "@/components/json.ld";
import { Card } from "@/components/ui/card";
import { ITabNavigatorTab } from "@/components/ui/tab-navigator";
import { getAllocators, getGoogleSheetAuditSizes } from "@/lib/api";
import { generatePageMetadata, groupBy } from "@/lib/utils";
import { Metadata } from "next";
import { Organization, WithContext } from "schema-dts";
import * as z from "zod";
import { DCFlowSankey, DCFlowSankeyProps } from "./components/dc-flow-sankey";
import { allocatorsTabs } from "../../constants";

type SankeyData = DCFlowSankeyProps["data"];
type Allocator = z.infer<typeof allocatorSchema>;

const acceptedAllocatorTypes = ["Automatic", "Manual", "Market-based"] as const;
const allocatorSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  type: z.enum(acceptedAllocatorTypes),
  datacap: z.bigint(),
});

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Allocators DataCap flow",
  description: "Fil+ DataCap Stats | Allocators DataCap flow",
  url: "https://datacapstats.io/allocators/dc-flow",
});

function sumAllocatorsDatacap(allocators: Allocator[]): bigint {
  return allocators.reduce(
    (sum, allocator) => sum + allocator.datacap,
    BigInt(0)
  );
}

async function loadSankeyData(): Promise<SankeyData> {
  const [sheetData, allocatorsData] = await Promise.all([
    getGoogleSheetAuditSizes(),
    getAllocators({
      page: "1",
      pageSize: "1000",
      showInactive: "true",
    }),
  ]);

  const [, ...rows] = sheetData.values;

  const allocators = rows
    .map((row) => {
      const [
        _applicationId,
        allocatorId,
        _pathwayName,
        _allocatorOrg,
        typeOfAllocator,
        _countryOfOperation,
        _region,
        _estimateUsageYTD,
        _approvalRound,
        _status,
      ] = row;

      const allocatorData = allocatorsData.data.find(
        (candidateAllocator) => candidateAllocator.addressId === allocatorId
      );

      if (!allocatorData) {
        return null;
      }

      const maybeAllocator = {
        id: allocatorId,
        name: allocatorData.name ?? allocatorId,
        type: typeOfAllocator,
        datacap: BigInt(allocatorData.initialAllowance),
      };

      const result = allocatorSchema.safeParse(maybeAllocator);

      return result.success ? result.data : null;
    })
    .filter(
      (maybeAllocator): maybeAllocator is Allocator => maybeAllocator !== null
    );

  const totalDatacap = sumAllocatorsDatacap(allocators);
  const grouped = groupBy(allocators, (item) => item.type);

  return Object.entries(grouped).reduce<SankeyData>(
    (result, entry, index) => {
      const [group, allocators] = entry;
      const totalGroupDatacap = sumAllocatorsDatacap(allocators);

      return {
        nodes: [
          ...result.nodes,
          {
            name: group,
            allocators,
            last: true,
            totalDatacap: totalGroupDatacap,
          },
        ],
        links: [
          ...result.links,
          { source: 0, target: index + 1, value: Number(totalGroupDatacap) },
        ],
      };
    },
    {
      nodes: [
        { name: "All Allocators", allocators, totalDatacap, last: false },
      ],
      links: [],
    }
  );
}

async function AllocatorsDatacapFlowPage() {
  const sankeyData = await loadSankeyData();

  const jsonLdData: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Fil+ Allocators DataCap Flow",
    image: "https://cryptologos.cc/logos/filecoin-fil-logo.png?v=040",
    description: "View allocators DataCap flow of Fil+ program",
  };

  return (
    <JsonLd data={jsonLdData}>
      <main className="main-content">
        <Card className="mt-[50px]">
          <GenericContentHeader
            selected={allocatorsTabs[3].value}
            navigation={allocatorsTabs}
          />
          <DCFlowSankey data={sankeyData} />
        </Card>
      </main>
    </JsonLd>
  );
}

export default AllocatorsDatacapFlowPage;
