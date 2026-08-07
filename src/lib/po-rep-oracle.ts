import z, { type ZodType } from "zod";
import { NumericalString, numericalStringSchema } from "./zod-extensions";
import { createJsonFetcher } from "./data-loading";
import { objectToURLSearchParams } from "./utils";

interface PoRepOracleResponse<T> {
  success: boolean;
  error: string | null;
  data: T;
}

export const PO_REP_ORACLE_API_URL =
  process.env.NEXT_PUBLIC_PO_REP_ORACLE_API_URL;

export function createResponseSchema<T>(
  dataSchema: ZodType<T, T>
): ZodType<PoRepOracleResponse<T>, PoRepOracleResponse<T>> {
  return z.object({
    success: z.boolean(),
    error: z.string().nullable(),
    data: dataSchema,
  });
}

// Gas Usage
export interface GasUsageParameters {
  onChainDealId?: NumericalString;
}

export type GasUsageResponse = z.infer<typeof gasUsageResponseSchema>;

const gasUsageDataSchema = z.object({
  onChainDealId: numericalStringSchema.nullable(),
  gasUsageByFunction: z.array(
    z.object({
      functionName: z.string(),
      transactionCount: numericalStringSchema,
      gasUsed: numericalStringSchema,
    })
  ),
  totalGasUsage: numericalStringSchema,
});

const gasUsageResponseSchema = createResponseSchema(gasUsageDataSchema);

// export async function fetchGasUsage(
//   _parameters: GasUsageParameters
// ): Promise<GasUsageResponse> {
//   return {
//     success: true,
//     data: {
//       onChainDealId: null,
//       gasUsageByFunction: [
//         {
//           functionName: "setDealEndEpoch",
//           transactionCount: "7",
//           gasUsed: "106473311",
//         },
//         {
//           functionName: "modifyRailPayment",
//           transactionCount: "7",
//           gasUsed: "1226462591",
//         },
//         {
//           functionName: "settleRail",
//           transactionCount: "8",
//           gasUsed: "5939024492",
//         },
//       ],
//       totalGasUsage: "7271960394",
//     },
//     error: null,
//   };
// }

export const fetchGasUsage = createJsonFetcher({
  url(parameters: GasUsageParameters) {
    const searchParams = objectToURLSearchParams(parameters ?? {}, true);
    return `${PO_REP_ORACLE_API_URL}/on-chain-transactions/gas-usage?${searchParams.toString()}`;
  },
  schema: gasUsageResponseSchema,
  context: "[PoRepOracle][Gas Usage]",
});
