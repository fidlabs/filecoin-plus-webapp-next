export const CDP_API_URL =
  process.env.NEXT_PUBLIC_CDP_API_URL ?? "https://cdp.allocator.tech";
export const DEFAULT_EDITION_ROUND_ID =
  process.env.NEXT_PUBLIC_DEFAULT_EDITION_ROUND_ID ?? "6";

export enum QueryKey {
  STORAGE_PROVIDERS_LIST = "storage_providers_list",
  STORAGE_PROVIDERS_COMPLIANCE_DATA = "storage_providers_compliance_data",
}
