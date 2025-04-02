const baseURL = "https://pulse.filecoindataportal.xyz";

export function createAllocatorLink(allocatorId: string): string {
  return baseURL + `/allocator/${allocatorId}`;
}

export function createClientLink(clientId: string): string {
  return baseURL + `/client/${clientId}`;
}

export function createStorageProviderLink(storageProviderId: string): string {
  return baseURL + `/provider/${storageProviderId}`;
}
