"use client";

import { OverlayLoader } from "@/components/overlay-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { cn, formatEnglishOrdinals } from "@/lib/utils";
import { uniq } from "lodash";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import useSWR from "swr";
import { useMediaQuery } from "usehooks-ts";
import { z } from "zod";
import {
  fetchAllocatorsAuditStates,
  type FetchAllocatorsAuditStatesParameters,
  type FetchAllocatorsAuditStatesReturnType,
} from "../allocators-data";

type CheckboxProps = ComponentProps<typeof Checkbox>;
type CheckedChangeHandler = NonNullable<CheckboxProps["onCheckedChange"]>;
type CardProps = ComponentProps<typeof Card>;
type AllocatorsData = FetchAllocatorsAuditStatesReturnType[number];
type Audit = AllocatorsData["audits"][number];
type AuditOutcome = Audit["outcome"];
export type AllocatorsAuditStatesWidgetProps = Omit<CardProps, "children">;

function getColorForOutcome(outcome: AuditOutcome): string {
  switch (outcome) {
    case "passed":
    case "notAudited":
      return "#66a61e";
    case "passedConditionally":
      return "#f2b94f";
    case "failed":
      return "#ff0029";
    default:
      return "#525252";
  }
}

function outcomeToHumanReadableText(outcome: AuditOutcome): string {
  switch (outcome) {
    case "passed":
      return "Passed";
    case "passedConditionally":
      return "Passed Conditionally";
    case "failed":
      return "Failed";
    case "invalid":
      return "Invalid";
    case "notAudited":
      return "Not Audited";
    case "unknown":
      return "Unknown";
  }
}

export function AllocatorsAuditStatesWidget({
  className,
  ...rest
}: AllocatorsAuditStatesWidgetProps) {
  const [showInactive, setShowInactive] = useState(false);
  const [showAuditedOnly, setShowAuditedOnly] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [parameters, setParameters] =
    useState<FetchAllocatorsAuditStatesParameters>({
      editionId: "6",
    });

  const { data, isLoading } = useSWR(
    [QueryKey.ALLOCATORS_AUDIT_STATES, parameters],
    ([, fetchParameters]) => fetchAllocatorsAuditStates(fetchParameters),
    {
      keepPreviousData: true,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 500);

  const auditStates = useMemo(() => {
    return (
      data?.filter((entry) => {
        const active = showInactive || entry.audits.length > 0;
        const audited =
          !showAuditedOnly ||
          entry.audits.some((audit) => {
            return ["passed", "passedConditionally", "failed"].includes(
              audit.outcome
            );
          });

        return active && audited;
      }) ?? []
    );
  }, [data, showAuditedOnly, showInactive]);
  const chartHeight = auditStates.length * 20 + 100;

  const domain = useMemo<[number, number]>(() => {
    const datacapAmounts = auditStates.map((allocator) => {
      return allocator.audits.reduce(
        (sum, audit) => sum + audit.datacap_amount,
        0
      );
    });

    return [0, Math.max(...datacapAmounts)];
  }, [auditStates]);

  const maxAuditsCount = useMemo<number>(() => {
    const auditCounts = auditStates.map((allocator) => allocator.audits.length);
    return Math.max(0, ...auditCounts);
  }, [auditStates]);

  const outcomesMap = useMemo(() => {
    const outcomes = auditStates.flatMap((entry) =>
      entry.audits.map((audit) => audit.outcome)
    );
    const uniqueOutcomes = uniq(outcomes);

    return uniqueOutcomes.reduce<Record<string, AuditOutcome[]>>(
      (result, outcome) => {
        const color = getColorForOutcome(outcome);
        const currentOutcomesForColor = result[color] ?? [];

        return {
          ...result,
          [color]: [...currentOutcomesForColor, outcome],
        };
      },
      {}
    );
  }, [auditStates]);

  const handleEditionChange = useCallback((editionId: string) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      editionId,
    }));
  }, []);

  const createAuditDatacapAccessor = useCallback((auditIndex: number) => {
    return (allocator: AllocatorsData) => {
      const audit = allocator.audits[auditIndex];

      if (!audit) {
        return 0;
      }

      return audit.outcome === "failed" ? 5 : audit.datacap_amount;
    };
  }, []);

  const yAxisDataKey = useCallback((dataItem: AllocatorsData) => {
    return dataItem.allocatorName ?? dataItem.allocatorId;
  }, []);

  const handleActivityCheckboxChange = useCallback<CheckedChangeHandler>(
    (checkedState) => {
      if (checkedState !== "indeterminate") {
        setShowInactive(checkedState);
      }
    },
    []
  );

  const handleAuditCheckboxChange = useCallback<CheckedChangeHandler>(
    (checkedState) => {
      if (checkedState !== "indeterminate") {
        setShowAuditedOnly(checkedState);
      }
    },
    []
  );

  return (
    <Card {...rest} className={cn("p-4", className)}>
      <h3 className="text-lg font-medium">Audit States</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Brows Allocator&apos;s audits outcomes and amounts of granted Datacap
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
        <Select
          value={parameters.editionId ?? "6"}
          onValueChange={handleEditionChange}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select edition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Edition 5</SelectItem>
            <SelectItem value="6">Edition 6</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1 items-center">
          <Checkbox
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={handleActivityCheckboxChange}
          >
            Show inactive
          </Checkbox>
          <label htmlFor="show-inactive" className="text-sm cursor-pointer">
            Show inactive allocators
          </label>
        </div>
        <div className="flex gap-1 items-center">
          <Checkbox
            id="show-audited-only"
            checked={showAuditedOnly}
            onCheckedChange={handleAuditCheckboxChange}
          >
            Show active
          </Checkbox>
          <label htmlFor="show-audited-only" className="text-sm cursor-pointer">
            Show only audited allocators
          </label>
        </div>
      </div>

      <div className="relative">
        <ResponsiveContainer height={chartHeight} debounce={200}>
          <BarChart
            data={auditStates}
            layout="vertical"
            margin={{
              left: isDesktop ? 120 : 0,
            }}
          >
            <Legend
              content={<LegendContent outcomesMap={outcomesMap} />}
              align="center"
              verticalAlign="top"
            />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip content={TooltipContent} />

            <YAxis
              dataKey={yAxisDataKey}
              type="category"
              tick={<YAxisTick />}
              interval={0}
              orientation={isDesktop ? "left" : "right"}
              mirror={!isDesktop}
            />

            <XAxis
              domain={domain}
              tickCount={Math.floor(domain[1] / 10) + 1}
              type="number"
              fontSize={14}
              height={40}
            >
              <Label
                value="Datacap (PiB)"
                position="insideBottomRight"
                fill="#666"
                fontSize={14}
              />
            </XAxis>

            {[...Array(maxAuditsCount)].map((_, auditIndex) => {
              return (
                <Bar
                  key={`audit_${auditIndex + 1}`}
                  dataKey={createAuditDatacapAccessor(auditIndex)}
                  stackId="audits"
                  style={{ stroke: "#fff", strokeWidth: 1 }}
                >
                  {auditStates.map((entry) => {
                    const audit = entry.audits[auditIndex];

                    return (
                      <Cell
                        key={`${entry.allocatorId}_audit_${auditIndex + 1}`}
                        fill={getColorForOutcome(audit?.outcome ?? "unknown")}
                      />
                    );
                  })}
                </Bar>
              );
            })}
          </BarChart>
        </ResponsiveContainer>
        <OverlayLoader show={!data || isLongLoading} />
      </div>
    </Card>
  );
}

interface LegendContentProps {
  outcomesMap: Record<string, AuditOutcome[]>;
}

function LegendContent({ outcomesMap }: LegendContentProps) {
  return (
    <ul className="flex flex-wrap gap-x-4 md:justify-center mb-4">
      {Object.entries(outcomesMap).map(([color, outcomes], index) => {
        return (
          <li
            key={index}
            className="flex items-center gap-x-2 text-sm text-muted-foreground"
          >
            <span
              className="inline-block h-4 w-4 rounded"
              style={{ backgroundColor: color }}
            />
            {outcomes.map(outcomeToHumanReadableText).join(", ")}
          </li>
        );
      })}
    </ul>
  );
}

const yAxisTickPropsSchema = z.object({
  x: z.number(),
  y: z.number(),
  payload: z.object({
    value: z.string(),
  }),
});

function YAxisTick(props: unknown) {
  const parsedProps = useMemo(() => {
    const result = yAxisTickPropsSchema.safeParse(props);

    return result.success ? result.data : null;
  }, [props]);

  if (!parsedProps) {
    return null;
  }

  const { x, y, payload } = parsedProps;
  const shortenedName =
    payload.value.length > 20
      ? payload.value.slice(0, 20) + "..."
      : payload.value;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dx={-5} dy={5} textAnchor="end" fontSize={14}>
        {shortenedName}
      </text>
    </g>
  );
}

function TooltipContent(props: TooltipContentProps<number, string>) {
  const { label, payload } = props;
  const allocator = payload?.[0]?.payload;

  if (!allocator) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>

      <CardContent>
        <ul>
          {(allocator as AllocatorsData).audits.map((audit, index) => {
            const auditNo = index + 1;

            return (
              <li key={index}>
                <span>{formatEnglishOrdinals(auditNo)} Audit - </span>
                <span
                  style={{
                    color: getColorForOutcome(audit.outcome),
                  }}
                >
                  {outcomeToHumanReadableText(audit.outcome)}{" "}
                  {audit.outcome !== "failed" && (
                    <span>({audit.datacap_amount} PiB)</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
