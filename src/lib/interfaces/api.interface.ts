export interface IApiQuery {
  [key: PropertyKey]: string | undefined;
}

export interface IAllocatorsQuery extends IApiQuery {
  page: string;
  showInactive: string;
  limit: string;
  filter: string;
  sort?: string;
}

export interface IClientsQuery extends IApiQuery {
  page: string;
  limit: string;
  filter: string;
  sort?: string;
}

export interface IStorageProvidersQuery extends IApiQuery {
  page: string;
  limit: string;
  filter: string;
  sort?: string;
}

export interface IAllocatorReportClientPaginationQuery extends IApiQuery {
  clientPaginationPage?: string;
  clientPaginationLimit?: string;
}

export interface IAllocatorReportProviderPaginationQuery extends IApiQuery {
  providerPaginationPage?: string;
  providerPaginationLimit?: string;
}
