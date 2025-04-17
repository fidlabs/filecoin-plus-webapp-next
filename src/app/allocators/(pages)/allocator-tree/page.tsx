import {Metadata} from "next";
import {getAllocators, getGoogleSheetAuditSizes} from "@/lib/api";
import {Structure} from "@/app/allocators/(pages)/allocator-tree/components/structure";
import {Organization, Person, WithContext} from "schema-dts";
import {JsonLd} from "@/components/json.ld";
import {IGoogleSheetResponse} from "@/lib/interfaces/cdp/google.interface";
import {generatePageMetadata} from "@/lib/utils";

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Allocators tree",
  description: "Fil+ DataCap Stats | Allocators tree",
  url: "https://datacapstats.io/allocator-tree",
})

const AllocatorsTreePage = async () => {

  const allocatorStatuses = await getGoogleSheetAuditSizes();
  const allAllocators = await getAllocators({
    page: '1',
    pageSize: '1000',
    showInactive: 'true',
  })

  const experimentalPathwayMetaAllocator = allAllocators.data.find(allocato => allocato.addressId = 'f03521515')

  const allocatorsTree: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fil+ Allocators Structure',
    image: 'https://cryptologos.cc/logos/filecoin-fil-logo.png?v=040',
    description: 'View allocators structure of Fil+ program',
    member: getSchemaMembers(allocatorStatuses)
  }

  return <JsonLd data={allocatorsTree}>
    <main className="main-content">
      <Structure allocatorStatuses={allocatorStatuses} allAllocators={allAllocators}/>
    </main>
  </JsonLd>
};

const getSchemaMembers = (allocatorStatuses: IGoogleSheetResponse) => {
  const _allocatorId = allocatorStatuses.values[0].indexOf('Allocator ID');
  const _allocatorName = allocatorStatuses.values[0].indexOf('Allocator Org');

  const members = [] as Person[];

  for (let i = 1; i < allocatorStatuses.values.length; i++) {
    const currentStatusRow = allocatorStatuses.values[i];

    if (!currentStatusRow[_allocatorId]) {
      continue;
    }

    members.push({
      "@type": "Person",
      "name": currentStatusRow[_allocatorName],
      "jobTitle": "Allocator",
      "url": `https://datacapstats.io/allocators/${currentStatusRow[_allocatorId]}`,
    });
  }
  return members;
}


export default AllocatorsTreePage;