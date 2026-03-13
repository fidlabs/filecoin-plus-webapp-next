"use client";

import { CompareIcon } from "@/components/icons/compare.icon";
import { TextCopyButton } from "@/components/text-copy-button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  CompareType,
  type ComparedValue,
  type IClientFullReport,
} from "@/lib/interfaces/cdp/cdp.interface";
import { ArrayElement, bigintToPercentage } from "@/lib/utils";
import { filesize } from "filesize";
import Link from "next/link";
import { ReactNode, useMemo } from "react";

export interface ReportViewProviderListProps {
  report: IClientFullReport;
  reportToCompare?: IClientFullReport;
}

interface ProviderParameterProps {
  value: ReactNode;
  label: ReactNode;
  compared?: CompareType;
  increaseNegative?: boolean;
}

type RawItem = ArrayElement<IClientFullReport["storage_provider_distribution"]>;
type EnrichedItem = RawItem & {
  duplicatedDataSize: bigint;
  duplicationPercentage: number;
  totalDealPercentage: number;
};

type ComparableField = ArrayElement<typeof comparableFields>;
type ComparedItem = Omit<EnrichedItem, ComparableField> & {
  [K in ComparableField]: ComparedValue<EnrichedItem[K]>;
};

const comparableFields = [
  "total_deal_size",
  "totalDealPercentage",
  "duplicationPercentage",
  "claims_count",
  "retrievability_success_rate_http",
  "retrievability_success_rate_url_finder",
  "consistent_retrievability",
  "inconsistent_retrievability",
  "ttfb",
  "bandwidth",
] as const satisfies Array<keyof EnrichedItem>;

const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

function enrichRawItem(rawItem: RawItem, allDealsSize: bigint): EnrichedItem {
  const uniqueDataSize = BigInt(rawItem.unique_data_size);
  const totalDealSize = BigInt(rawItem.total_deal_size);
  const duplicatedDataSize = totalDealSize - uniqueDataSize;

  return {
    ...rawItem,
    duplicatedDataSize,
    duplicationPercentage:
      bigintToPercentage(duplicatedDataSize, totalDealSize, 6) / 100,
    totalDealPercentage:
      bigintToPercentage(totalDealSize, allDealsSize, 6) / 100,
  };
}

function compareValues<T>(
  givenValue: T,
  comparedValue: unknown
): ComparedValue<T> {
  if (typeof givenValue === "string" && typeof comparedValue === "string") {
    try {
      const givenValueBigInt = BigInt(givenValue);
      const comparedValueBigInt = BigInt(comparedValue);

      return {
        value: givenValue,
        result:
          givenValueBigInt === comparedValueBigInt
            ? "equal"
            : givenValueBigInt > comparedValueBigInt
              ? "up"
              : "down",
      };
    } catch (error) {
      return {
        value: givenValue,
        result: undefined,
      };
    }
  }

  if (typeof givenValue === "number" && typeof comparedValue === "number") {
    return {
      value: givenValue,
      result:
        givenValue === comparedValue
          ? "equal"
          : givenValue > comparedValue
            ? "up"
            : "down",
    };
  }

  return {
    value: givenValue,
    result: undefined,
  };
}

function compareEnrichedItems(
  givenItem: EnrichedItem,
  comparedItem?: EnrichedItem
): ComparedItem {
  const comparedEntries = comparableFields.map((field) => {
    return [field, compareValues(givenItem[field], comparedItem?.[field])];
  });

  return {
    ...givenItem,
    ...Object.fromEntries(comparedEntries),
  };
}

export function ReportViewProviderList({
  report,
  reportToCompare,
}: ReportViewProviderListProps) {
  const items = useMemo(() => {
    const allDealsSize = report.storage_provider_distribution.reduce(
      (sum, item) => {
        return sum + BigInt(item.total_deal_size);
      },
      0n
    );
    const comparedAllDealsSize =
      reportToCompare?.storage_provider_distribution.reduce((sum, item) => {
        return sum + BigInt(item.total_deal_size);
      }, 0n) ?? 0n;
    const enrichedItems = report.storage_provider_distribution.map((item) =>
      enrichRawItem(item, allDealsSize)
    );
    const comparedEnrichedItems = reportToCompare
      ? reportToCompare.storage_provider_distribution.map((item) =>
          enrichRawItem(item, comparedAllDealsSize)
        )
      : [];

    return enrichedItems.map((item) => {
      const comparedItem = comparedEnrichedItems.find(
        (candidate) => item.provider === candidate.provider
      );
      return compareEnrichedItems(item, comparedItem);
    });
  }, [report, reportToCompare]);

  const hideSparkRetrievability = useMemo(() => {
    return items.every((item) => {
      return typeof item.retrievability_success_rate_http !== "number";
    });
  }, [items]);

  return (
    <div>
      {items.map((item) => (
        <article
          key={item.provider}
          className="p-4 border-t odd:bg-gray-300/10"
        >
          <header className="mb-4">
            <h3>
              <Link
                className="text-md font-semibold underline"
                href={`/storage-providers/${item.provider}`}
              >
                {item.provider}
              </Link>
            </h3>

            <HoverCard>
              <HoverCardTrigger>
                <p className="text-sm whitespace-nowrap">
                  {item.location.city}, {item.location.region},{" "}
                  {item.location.country}
                </p>
              </HoverCardTrigger>
              <HoverCardContent>{item.location.org}</HoverCardContent>
            </HoverCard>

            {item.piece_working_url ? (
              <TextCopyButton
                variant="link"
                className="text-xs"
                copiedText={item.piece_working_url}
                successMessage="Copied Piece URL to clipboard"
              >
                Copy Sample Piece URL
              </TextCopyButton>
            ) : (
              <p className="py-1 text-xs text-orange-500">
                Sample Piece URL not found
              </p>
            )}
          </header>

          <div className="flex flex-wrap gap-x-6 lg:gap-x-8 xl:gap-x-10 gap-y-4">
            <ProviderParameter
              label="Total Deal Size"
              value={filesize(item.total_deal_size.value, { standard: "iec" })}
              compared={item.total_deal_size.result}
            />

            <ProviderParameter
              label="Deal Percentage"
              value={percentageFormatter.format(item.totalDealPercentage.value)}
              compared={item.totalDealPercentage.result}
            />

            <ProviderParameter
              label="Duplication"
              value={`${percentageFormatter.format(item.duplicationPercentage.value)} / ${filesize(item.duplicatedDataSize, { standard: "iec" })}`}
              compared={item.duplicationPercentage.result}
              increaseNegative
            />

            <ProviderParameter
              label="Total Claims"
              value={item.claims_count.value}
              compared={item.claims_count.result}
            />

            {!hideSparkRetrievability && (
              <ProviderParameter
                label="HTTP Retrievability"
                value={
                  typeof item.retrievability_success_rate_http.value ===
                  "number"
                    ? percentageFormatter.format(
                        item.retrievability_success_rate_http.value
                      )
                    : "N/A"
                }
                compared={item.retrievability_success_rate_http.result}
              />
            )}

            <ProviderParameter
              label="RPA"
              value={
                typeof item.retrievability_success_rate_url_finder.value ===
                "number"
                  ? percentageFormatter.format(
                      item.retrievability_success_rate_url_finder.value
                    )
                  : "N/A"
              }
              compared={item.retrievability_success_rate_url_finder.result}
            />

            <ProviderParameter
              label="Consistent RPA"
              value={
                typeof item.consistent_retrievability.value === "number"
                  ? percentageFormatter.format(
                      item.consistent_retrievability.value
                    )
                  : "N/A"
              }
              compared={item.consistent_retrievability.result}
            />

            <ProviderParameter
              label="Inconsistent RPA"
              value={
                typeof item.inconsistent_retrievability.value === "number"
                  ? percentageFormatter.format(
                      item.inconsistent_retrievability.value
                    )
                  : "N/A"
              }
              compared={item.inconsistent_retrievability.result}
            />

            <ProviderParameter
              label="Time to First Byte"
              value={
                typeof item.ttfb.value === "number"
                  ? `${item.ttfb.value} ms`
                  : "N/A"
              }
              compared={item.ttfb.result}
              increaseNegative
            />

            <ProviderParameter
              label="Bandwidth"
              value={
                typeof item.bandwidth.value === "number"
                  ? `${item.bandwidth.value} Mbps`
                  : "N/A"
              }
              compared={item.bandwidth.result}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function ProviderParameter({
  compared,
  label,
  increaseNegative,
  value,
}: ProviderParameterProps) {
  return (
    <div>
      <div className="flex items-center gap-1">
        <p className="font-medium">{value}</p>
        {!!compared && (
          <CompareIcon compare={compared} increaseNegative={increaseNegative} />
        )}
      </div>

      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
