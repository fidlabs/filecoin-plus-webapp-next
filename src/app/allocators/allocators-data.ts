import { CDP_API_URL } from "@/lib/constants";
import { throwHTTPErrorOrSkip } from "@/lib/http-errors";
import { IAllocatorsResponse } from "@/lib/interfaces/dmob/allocator.interface";
import { objectToURLSearchParams } from "@/lib/utils";
import { z } from "zod";

// Allocators list
export interface FetchAllocatorsParameters {
  editionId?: string;
  filter?: string;
  usingMetaallocator?: string;
  limit?: number;
  page?: number;
  sort?: string;
  order?: "asc" | "desc";
  showInactive?: boolean;
  isMetaallocator?: boolean;
}

export type FetchAllocatorsReturnType = IAllocatorsResponse;

export async function fetchAllocators(
  parameters: FetchAllocatorsParameters = {}
) {
  const searchParams = objectToURLSearchParams(parameters, true);
  const endpoint = `${CDP_API_URL}/allocators?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching allocators; URL: ${endpoint}`
  );

  const data = await response.json();
  return data as IAllocatorsResponse;
}

// Allocators by compliance list
export interface FetchAllocatorsByComplianceParameters
  extends Omit<FetchAllocatorsParameters, "showInactive" | "isMetaallocator"> {
  retrievability?: boolean;
  numberOfClients?: boolean;
  totalDealSize?: boolean;
  week?: string;
  complianceThresholdPercentage?: number;
  complianceScore?: "nonCompliant" | "partiallyCompliant" | "compliant";
}

export type FetchAllocatorsByComplianceReturnType = IAllocatorsResponse;

export async function fetchAllocatorsByCompliance(
  parameters: FetchAllocatorsByComplianceParameters = {}
) {
  const searchParams = objectToURLSearchParams(parameters, true);
  const endpoint = `${CDP_API_URL}/allocators/compliance-data?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching allocators compliance data; URL: ${endpoint}`
  );

  const data = await response.json();
  return data as IAllocatorsResponse;
}

// Allocators Storage Providers compliance data
const allocatorsSPsComplianceDataSchema = z.object({
  averageSuccessRate: z.number(),
  results: z.array(
    z.object({
      week: z.string(),
      averageSuccessRate: z.number(),
      allocators: z.array(
        z.object({
          compliantSpsPercentage: z.number(),
          partiallyCompliantSpsPercentage: z.number(),
          nonCompliantSpsPercentage: z.number(),
          totalSps: z.number(),
          totalDatacap: z.union([z.string(), z.number()]),
        })
      ),
    })
  ),
});

type AllocatorsSPsComplianceData = z.infer<
  typeof allocatorsSPsComplianceDataSchema
>;

function assertIsAllocatorsSPsComplianceData(
  input: unknown
): asserts input is AllocatorsSPsComplianceData {
  const result = allocatorsSPsComplianceDataSchema.safeParse(input);

  if (!result.success) {
    throw new TypeError(
      "Invalid response from CDP when fetching allocators SPs compliance data"
    );
  }
}

export interface FetchAllocatorsSPsComplianceDataParameters {
  editionId?: string;
  retrievability?: boolean;
  numberOfClients?: boolean;
  totalDealSize?: boolean;
}

export type FetchAllocatorsSPsComplianceDataReturnType =
  AllocatorsSPsComplianceData;

export async function fetchAllocatorsSPsComplianceData(
  parameters: FetchAllocatorsSPsComplianceDataParameters = {}
): Promise<FetchAllocatorsSPsComplianceDataReturnType> {
  const searchParams = objectToURLSearchParams(parameters, true);
  const endpoint = `${CDP_API_URL}/stats/acc/allocators/sps-compliance?${searchParams.toString()}`;
  const response = await fetch(endpoint);

  throwHTTPErrorOrSkip(
    response,
    `CDP API returned status ${response.status} when fetching allocators SPs compliance data; URL: ${endpoint}`
  );

  const data = await response.json();

  assertIsAllocatorsSPsComplianceData(data);

  return data;
}
