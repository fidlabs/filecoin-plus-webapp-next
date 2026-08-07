import { getAllocators, getStorageProviders } from "@/lib/api";
import { MetadataRoute } from "next";
import { fetchClients } from "./clients/clients-data";

// Define the base URL of your application
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://filplus.storage";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get the current date for lastModified
  const currentDate = new Date();

  // Define the static routes of your application
  const staticRoutes = [
    "",
    "/about",
    "/allocators",
    "/allocators/audit-flow",
    "/allocators/datacap-flow",
    "/clients",
    "/storage-providers",
    "/po_rep",
  ];

  const staticSitemapEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const storageProviders = await getStorageProviders({
    page: "1",
    limit: "10000",
  });
  const storageProviderSitemapEntries = storageProviders.data.map(
    ({ provider }) => ({
      url: `${baseUrl}/storage-providers/${provider}`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })
  );

  const clients = await fetchClients();
  const clientSitemapEntries = clients.data.map(({ id }) => {
    return [
      {
        url: `${baseUrl}/clients/${id}`,
        lastModified: currentDate,
        changeFrequency: "daily" as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/clients/${id}/allocations`,
        lastModified: currentDate,
        changeFrequency: "daily" as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/clients/${id}/providers`,
        lastModified: currentDate,
        changeFrequency: "daily" as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/clients/${id}/reports`,
        lastModified: currentDate,
        changeFrequency: "daily" as const,
        priority: 0.7,
      },
    ];
  });

  const allocators = await getAllocators({
    page: "1",
    limit: "1000",
    showInactive: "true",
  });
  const allocatorSitemapEntries = allocators.data.map(({ addressId }) => {
    return [
      {
        url: `${baseUrl}/allocators/${addressId}`,
        lastModified: currentDate,
        changeFrequency: "daily" as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/allocators/${addressId}/over-time`,
        lastModified: currentDate,
        changeFrequency: "daily" as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/allocators/${addressId}/reports`,
        lastModified: currentDate,
        changeFrequency: "daily" as const,
        priority: 0.7,
      },
    ];
  });

  return [
    ...staticSitemapEntries.flat(),
    ...storageProviderSitemapEntries.flat(),
    ...clientSitemapEntries.flat(),
    ...allocatorSitemapEntries.flat(),
  ];
}
