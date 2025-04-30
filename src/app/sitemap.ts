import {MetadataRoute} from 'next';
import {getAllocators, getClients, getStorageProviders} from "@/lib/api";

// Define the base URL of your application
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://filplus.storage';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get the current date for lastModified
  const currentDate = new Date();

  // Define the static routes of your application
  const staticRoutes = [
    '',
    '/about',
    '/allocators',
    '/allocators/audit-flow',
    '/allocators/datacap-flow',
    '/clients',
    '/compliance-data-portal',
    '/storage-providers',
    '/compliance-data-portal/allocators/retrievability',
    '/compliance-data-portal/allocators/biggest-deals',
    '/compliance-data-portal/allocators/providers-compliance',
    '/compliance-data-portal/allocators/audit-state',
    '/compliance-data-portal/allocators/audit-outcomes',
    '/compliance-data-portal/allocators/audit-timeline',
    '/compliance-data-portal/allocators/client-diversity',
    '/compliance-data-portal/old-datacap/owned-by-entities',
    '/compliance-data-portal/old-datacap/allocated-to-clients',
    '/compliance-data-portal/old-datacap/owned-by-clients',
    '/compliance-data-portal/old-datacap/spent-by-clients',
    '/compliance-data-portal/storage-providers/compliance',
    '/compliance-data-portal/storage-providers/retrievability',
    '/compliance-data-portal/storage-providers/number-of-deals',
    '/compliance-data-portal/storage-providers/biggest-deals',
    '/compliance-data-portal/storage-providers/ipni-misreporting',
    '/compliance-data-portal/storage-providers/client-diversity',
  ];

  const staticSitemapEntries = staticRoutes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const storageProviders = await getStorageProviders({
    'page': '1',
  });
  const storageProviderSitemapEntries = storageProviders.data.map(({provider}) => ({
    url: `${baseUrl}/storage-providers/${provider}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const clients = await getClients({
    'page': '1',
  });
  const clientSitemapEntries = clients.data.map(({addressId}) => {
    return [
      {
        url: `${baseUrl}/clients/${addressId}`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: 0.7,
      },{
        url: `${baseUrl}/clients/${addressId}/allocations`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: 0.7,
      },{
        url: `${baseUrl}/clients/${addressId}/providers`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: 0.7,
      },{
        url: `${baseUrl}/clients/${addressId}/reports`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: 0.7,
      },
    ]
  });


  const allocators = await getAllocators({
    'page': '1',
    'showInactive': 'true',
  });
  const allocatorSitemapEntries = allocators.data.map(({addressId}) => {
    return [{
      url: `${baseUrl}/allocators/${addressId}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },{
      url: `${baseUrl}/allocators/${addressId}/over-time`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },{
      url: `${baseUrl}/allocators/${addressId}/reports`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },];
  });

  return [
    ...(staticSitemapEntries).flat(),
    ...(storageProviderSitemapEntries.flat()),
    ...(clientSitemapEntries.flat()),
    ...(allocatorSitemapEntries.flat()),
  ]
}
