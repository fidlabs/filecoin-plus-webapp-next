export const CDP_API_URL =
  process.env.NEXT_PUBLIC_CDP_API_URL ?? "https://cdp.allocator.tech";
export const DCS_API_URL = "https://api.datacapstats.io/api";
export const DEFAULT_EDITION_ROUND_ID =
  process.env.NEXT_PUBLIC_DEFAULT_EDITION_ROUND_ID ?? "6";

export enum QueryKey {
  ALLOCATORS_LIST = "allocators_list",
  ALLOCATORS_AUDIT_STATES = "allocators_audit_states",
  ALLOCATORS_AUDIT_OUTCOMES = "allocators_audit_outcomes",
  ALLOCATORS_AUDIT_TIMES = "allocators_audit_times",
  ALLOCATORS_SPS_COMPLIANCE_DATA = "allocators_sps_compliance_data",
  ALLOCATORS_RETRIEVABILITY = "allocators_retrievability",
  ALLOCATORS_CLIENT_DIVERSITY = "allocators_client_diversity",
  ALLOCATORS_CLIENT_DISTRIBUTION = "allocators_client_distribution",
  ALLOCATORS_OLD_DATACAP = "allocators_old_datacap",
  ALLOCATORS_CHECKS_BREAKDOWN = "allocators_checks_breakdown",
  ALLOCATORS_SCORING_BREAKDOWN = "allocators_scoring_breakdown",
  ALLOCATORS_STATISTICS = "allocators_statistics",
  CLIENTS_LIST = "clients_list",
  CLIENTS_OLD_DATACAP = "clients_old_datacap",
  CLIENT_ALLOCATIONS = "client_allocations",
  CLIENT_LATEST_CLAIMS = "client_latest_claim",
  CLIENT_PROVIDERS = "client_providers",
  CLIENT_REPORTS = "client_reports",
  CLIENTS_STATISTICS = "clients_statistics",
  DASHBOARD_STATISTICS = "dashboard_statistics",
  STORAGE_PROVIDERS_LIST = "storage_providers_list",
  STORAGE_PROVIDERS_COMPLIANCE_DATA = "storage_providers_compliance_data",
  STORAGE_PROVIDERS_RETRIEVABILITY_DATA = "storage_providers_retrievability_data",
  STORAGE_PROVIDERS_CLIENT_DIVERSITY_DATA = "storage_providers_client_diversity_data",
  STORAGE_PROVIDERS_CLIENT_DISTRIBUTION_DATA = "storage_providers_client_distribution_data",
  STORAGE_PROVIDERS_IPNI_MISREPORTING_DATA = "storage_providers_ipni_misreporting_data",
  STORAGE_PROVIDERS_STATISTICS = "storage_providers_statistics",
}

export enum AllocatorsPageSectionId {
  COMPLIANCE = "compliance",
  ALLOCATORS_LIST = "allocators-list",
  METAALLOCATORS_LIST = "metaallocator-list",
  RETRIEVABILITY = "retrievability",
  CLIENT_DIVERSITY = "client-diversity",
  CLIENT_DISTRIBUTION = "client-distribution",
  SCORING_BREAKDOWN = "scoring-breakdown",
  ALERTS_BREAKDOWN = "alerts-breakdown",
  DC_FLOW = "dc-flow",
  AUDITS_FLOW = "audits-flow",
  AUDITS_STATE = "audits-state",
  AUDIT_OUTCOMES = "audit-outcomes",
  AUDIT_TIMES = "audit-times",
  LEADERBOARDS = "leaderboards",
  OLD_DATACAP = "old-datacap",
}

export enum ClientsPageSectionId {
  STATS = "stats",
  LIST = "list",
  OLD_DATACAP = "old-datacap",
}

export enum ClientDetailsPageSectionId {
  LATEST_CLAIMS = "latest-claims",
  PROVIDERS = "providers",
  ALLOCATIONS = "allocations",
  REPORTS = "reports",
}

export enum StorageProvidersPageSectionId {
  COMPLIANCE = "compliance",
  LIST = "list",
  RETRIEVABILITY = "retrievability",
  CLIENT_DIVERSITY = "client-diversity",
  CLIENT_DISTRIBUTION = "client-distribution",
  IPNI_MISREPORTING = "ipni-misreporting",
}

export const CHECKS_BREAKDOWN_INTERVAL_PARAM_KEY = "interval";
