export interface IApiQuery {
  [key: PropertyKey]: string | number | boolean | undefined;
}

export interface IAllocatorsQuery extends IApiQuery {
  page: number;
  showInactive: boolean;
  limit: number;
  filter: string;
  sort?: string
}

export interface IClientsQuery extends IApiQuery {
  page: number;
  limit: number;
  filter: string;
  sort?: string
}

export interface IStorageProvidersQuery extends IApiQuery {
  page: number;
  limit: number;
  filter: string;
  sort?: string
}