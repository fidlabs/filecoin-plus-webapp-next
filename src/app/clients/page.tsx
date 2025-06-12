import { Metadata } from "next";
import { ClientsList } from "@/app/clients/components/clients-list";
import { Suspense } from "react";
import { PageHeader, PageSubTitle, PageTitle } from "@/components/ui/header";
import { IClientsQuery } from "@/lib/interfaces/api.interface";
import { getClients } from "@/lib/api";
import { ItemList, WithContext } from "schema-dts";
import { JsonLd } from "@/components/json.ld";
import { generatePageMetadata } from "@/lib/utils";

export const metadata: Metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats | Clients",
  description:
    "A convenient way to browse and search for Filecoin Plus Clients.",
  url: "https://datacapstats.io/clients",
});

interface PageProps {
  searchParams: IClientsQuery;
}

const ClientsPage = async ({ searchParams }: PageProps) => {
  const currentParams = {
    page: searchParams?.page ?? "1",
    limit: searchParams?.limit ?? "10",
    filter: searchParams?.filter ?? "",
    sort: searchParams?.sort ?? "",
  };
  const clients = await getClients(currentParams);

  const listJsonLD: WithContext<ItemList> = {
    "@context": "https://schema.org",
    name: "Allocators",
    "@type": "ItemList",
    itemListElement: clients?.data.map((client, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@id": `https://datacapstats.io/clients/${client.id}`,
        name: client.name,
      },
    })),
  };

  return (
    <JsonLd data={listJsonLD}>
      <PageHeader
        leftContent={
          <>
            <PageTitle>Clients</PageTitle>
            <PageSubTitle>
              View all clients participating in Filecoin
            </PageSubTitle>
          </>
        }
      />
      <main className="main-content">
        <Suspense>
          <ClientsList clients={clients} params={currentParams} />
        </Suspense>
      </main>
    </JsonLd>
  );
};

export default ClientsPage;
