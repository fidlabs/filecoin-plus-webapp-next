export const CDP_API_URL =
  process.env.NEXT_PUBLIC_CDP_API_URL ?? "https://cdp.allocator.tech";
export const DEFAULT_EDITION_ROUND_ID =
  process.env.NEXT_PUBLIC_DEFAULT_EDITION_ROUND_ID ?? "6";

export enum QueryKey {
  ALLOCATORS_LIST = "allocators_list",
  ALLOCATORS_AUDIT_STATES = "allocators_audist_states",
  STORAGE_PROVIDERS_LIST = "storage_providers_list",
  STORAGE_PROVIDERS_COMPLIANCE_DATA = "storage_providers_compliance_data",
  STORAGE_PROVIDERS_RETRIEVABILITY_DATA = "storage_providers_retrievability_data",
  STORAGE_PROVIDERS_CLIENT_DIVERSITY_DATA = "storage_providers_client_diversity_data",
  STORAGE_PROVIDERS_CLIENT_DISTRIBUTION_DATA = "storage_providers_client_distribution_data",
  STORAGE_PROVIDERS_IPNI_MISREPORTING_DATA = "storage_providers_ipni_misreporting_data",
}

export enum AllocatorsPageSectionId {
  ALLOCATORS_LIST = "allocators-list",
  METAALLOCATORS_LIST = "metaallocator-list",
  DC_FLOW = "dc-flow",
  AUDITS_FLOW = "audits-flow",
}

export enum StorageProvidersPageSectionId {
  COMPLIANCE = "compliance",
  LIST = "list",
  RETRIEVABILITY = "retrievability",
  CLIENT_DIVERSITY = "client-diversity",
  CLIENT_DISTRIBUTION = "client-distribution",
  IPNI_MISREPORTING = "ipni-misreporting",
}
