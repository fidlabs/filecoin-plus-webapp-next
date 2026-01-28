import { CDP_API_URL, DCS_API_URL } from "@/lib/constants";
import { throwHTTPErrorOrSkip } from "@/lib/http-errors";
import {
  type IClientAllocationsResponse,
  type IClientsResponse,
} from "@/lib/interfaces/dmob/client.interface";
import {
  cdpClientsStatisticsResponseSchema,
  type ClientsDashboardStatistic,
} from "@/lib/schemas";
import { assertSchema, objectToURLSearchParams } from "@/lib/utils";
import { numericalStringSchema } from "@/lib/zod-extensions";
import { z } from "zod";

type PaginationParameters =
  | {
      limit: number;
      page: number;
    }
  | {
      limit?: undefined;
      page?: undefined;
    }
  | never;

// Statstics
export interface FetchClientsDashboardStatisticsParameters {
  interval?: "day" | "week" | "month";
}

export type FetchClientsDashboardStatisticsReturnType =
  ClientsDashboardStatistic[];

export async function fetchClientsDashboardStatistics(
  parameters?: FetchClientsDashboardStatisticsParameters
): Promise<FetchClientsDashboardStatisticsReturnType> {
  const searchParams = objectToURLSearchParams(parameters ?? {});
  const endpoint = `${CDP_API_URL}/clients/statistics?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching clients statistics; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    cdpClientsStatisticsResponseSchema,
    `CDP API returned invalid response when fetching clients statistics; URL: ${endpoint}`
  );

  return json;
}

// Clients list
export interface FetchClientsParameters {
  page?: number;
  limit?: number;
  filter?: string;
  sort?: {
    key: string;
    direction: "asc" | "desc";
  };
}

export type FetchClientsReturnType = IClientsResponse;

export async function fetchClients(
  parameters: FetchClientsParameters = {}
): Promise<FetchClientsReturnType> {
  const { sort, ...restOfParameters } = parameters;
  const searchParams = objectToURLSearchParams(
    {
      ...restOfParameters,
      sort: sort
        ? `[["${sort.key}",${sort.direction === "asc" ? "1" : "0"}]]`
        : undefined,
    },
    true
  );
  const endpoint =
    await `${DCS_API_URL}/getVerifiedClients?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `DCS API returned error when fetching clients list; URL: ${endpoint}`
  );

  const data = await response.json();
  return data as IClientsResponse;
}

// Old datacap
const clientsOldDatacapResponseSchema = z.object({
  results: z.array(
    z.object({
      week: z.string().datetime(),
      clients: z.number(),
      oldDatacap: numericalStringSchema,
      claims: numericalStringSchema,
      drilldown: z.array(
        z.object({
          client: z.string(),
          clientName: z.string().nullable(),
          oldDatacap: numericalStringSchema,
          claims: numericalStringSchema,
        })
      ),
    })
  ),
});

export type FetchClientsOldDatacapReturnType = z.infer<
  typeof clientsOldDatacapResponseSchema
>;

export async function fetchClientsOldDatacap(): Promise<FetchClientsOldDatacapReturnType> {
  const endpoint = `${CDP_API_URL}/stats/old-datacap/client-balance`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching clients' old datacap; URL: ${endpoint}`
  );

  const data = await response.json();

  assertSchema(
    data,
    clientsOldDatacapResponseSchema,
    `Invalid response from CDP API when fetching allocators old datacap; URL: ${endpoint}`
  );

  return data as FetchClientsOldDatacapReturnType; // cast beacause for some reason Zod does not like custom schema here
}

// Client latest claims
export type FetchClientLatestClaimsParameters = PaginationParameters & {
  clientId: string;
  sort?: string;
  order?: "asc" | "desc";
  filter?: string;
};

export type FetchClientLatestClaimsReturnType = z.infer<
  typeof latestClaimsResponseSchema
>;

const latestClaimsResponseSchema = z.object({
  pagination: z.object({
    total: z.number(),
    limit: z.number().nullish(),
    page: z.number().nullish(),
    pages: z.number().nullish(),
  }),
  count: z.number(),
  totalSumOfDdoPieceSize: numericalStringSchema,
  totalSumOfNonDdoPieceSize: numericalStringSchema,
  data: z.array(
    z.object({
      id: z.number(),
      dealId: z.number(),
      clientId: z.string(),
      type: z.string(),
      providerId: z.string(),
      pieceCid: z.string(),
      pieceSize: numericalStringSchema,
      createdAt: z.string().datetime(),
      isDDO: z.boolean(),
    })
  ),
});

export async function fetchClientLatestClaims({
  clientId,
  ...restOfParameters
}: FetchClientLatestClaimsParameters): Promise<FetchClientLatestClaimsReturnType> {
  const searchParams = objectToURLSearchParams(restOfParameters, true);
  const endpoint = `${CDP_API_URL}/clients/${clientId}/latest-claims?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching client ${clientId} latest claims; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    latestClaimsResponseSchema,
    `CDP API returned invalid response when fetching client ${clientId} latest claims`
  );

  return json as FetchClientLatestClaimsReturnType;
}

// Client providers
export interface FetchClientProvidersParameters {
  clientId: string;
}

export type FetchClientProvidersReturnType = z.infer<
  typeof clientProvidersResponseSchema
>;

const clientProvidersResponseSchema = z.object({
  name: z.string().nullable(),
  stats: z.array(
    z.object({
      provider: z.string(),
      total_deal_size: numericalStringSchema,
      percent: z.string(),
    })
  ),
});

export async function fetchClientProviders({
  clientId,
}: FetchClientProvidersParameters): Promise<FetchClientProvidersReturnType> {
  const endpoint = `${CDP_API_URL}/clients/${clientId}/providers`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching Client's Providers breakdown; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    clientProvidersResponseSchema,
    `CDP API returned invalid data when fetching Client's Providers breakdown; URL: ${endpoint}`
  );

  return json as FetchClientProvidersReturnType;
}

// Client allocations
export interface FetchClientAllocationsParameters {
  clientId: string;
}

export type FetchClientAllocationsReturnType = IClientAllocationsResponse;

export async function fetchClientAllocations({
  clientId,
}: FetchClientAllocationsParameters): Promise<FetchClientAllocationsReturnType> {
  const endpoint = `${DCS_API_URL}/getVerifiedClients?filter=${clientId}`;
  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  throwHTTPErrorOrSkip(
    response,
    `DCS API returned status ${response.status} when fetching Client's allocations; URL: ${endpoint}`
  );

  const json = await response.json();
  return json as FetchClientAllocationsReturnType;
}

// Client reports
export interface FetchClientReportsParameters {
  clientId: string;
}

export type FetchClientReportsReturnType = z.infer<
  typeof clientReportsResponseSchema
>;

const clientReportsResponseSchema = z.array(
  z.object({
    id: z.string(),
    create_date: z.string().datetime(),
    client: z.string(),
    // more fields are returned here but we don't care about them atm
  })
);

export async function fetchClientReports({
  clientId,
}: FetchClientReportsParameters): Promise<FetchClientReportsReturnType> {
  const endpoint = `${CDP_API_URL}/client-report/${clientId}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching client's reports list; URL: ${endpoint}`
  );

  const json = await response.json();

  assertSchema(
    json,
    clientReportsResponseSchema,
    `CDP API returned status invalid response when fetching client's reports list; URL: ${endpoint}`
  );

  return json;
}
