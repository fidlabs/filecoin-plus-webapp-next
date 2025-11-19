import { CDP_API_URL, DCS_API_URL } from "@/lib/constants";
import { throwHTTPErrorOrSkip } from "@/lib/http-errors";
import { IClientsResponse } from "@/lib/interfaces/dmob/client.interface";
import { assertSchema, objectToURLSearchParams } from "@/lib/utils";
import { numericalStringSchema } from "@/lib/zod-extensions";
import { z } from "zod";

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
