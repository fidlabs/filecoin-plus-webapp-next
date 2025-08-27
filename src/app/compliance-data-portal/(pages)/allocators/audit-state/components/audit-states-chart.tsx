"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AllocatorsAuditStatesResponse } from "@/lib/api";
import { formatEnglishOrdinals, palette } from "@/lib/utils";
import { uniq } from "lodash";
import { useCallback, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { useMediaQuery } from "usehooks-ts";
import { z } from "zod";

export interface AuditStatesChartProps {
  data: AllocatorsAuditStatesResponse;
}

type DataItem = AuditStatesChartProps["data"][number];
type AuditOutcome = DataItem["audits"][number]["outcome"];

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
      return "unknown";
  }
}

export function AuditStatesChart({ data }: AuditStatesChartProps) {
  const chartHeight = data.length * 20 + 100;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [maxAuditsCount, maxValue] = useMemo(() => {
    return data.reduce(
      ([currentMaxAuditsCount, currentMaxValue], item) => {
        const totalDatacap = item.audits.reduce(
          (sum, audit) => sum + audit.datacap_amount,
          0
        );

        return [
          Math.max(currentMaxAuditsCount, item.audits.length),
          Math.max(currentMaxValue, totalDatacap),
        ];
      },
      [0, 0]
    );
  }, [data]);

  const outcomesMap = useMemo(() => {
    const outcomes = data.flatMap((entry) =>
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
  }, [data]);

  const createAuditDatacapAccessor = useCallback((auditIndex: number) => {
    return (dataItem: DataItem) => {
      const audit = dataItem.audits[auditIndex];

      if (!audit) {
        return 0;
      }

      return audit.outcome === "failed" ? 5 : audit.datacap_amount;
    };
  }, []);

  const yAxisDataKey = useCallback((dataItem: DataItem) => {
    return dataItem.allocatorName ?? dataItem.allocatorId;
  }, []);

  return (
    <ResponsiveContainer width="100%" debounce={500} height={chartHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          left: isDesktop ? 120 : 0,
          bottom: 20,
        }}
      >
        <Legend
          content={<LegendContent outcomesMap={outcomesMap} />}
          align="center"
          verticalAlign="top"
        />
        <Tooltip
          content={TooltipContent}
          cursor={{ fill: "rgba(0,0,0,0.2)" }}
        />
        <CartesianGrid strokeDasharray="3 3" />

        {[...Array(maxAuditsCount)].map((_, auditIndex) => {
          return (
            <Bar
              key={`audit_${auditIndex + 1}`}
              dataKey={createAuditDatacapAccessor(auditIndex)}
              layout="vertical"
              stackId="audits"
              style={{ stroke: "#fff", strokeWidth: 1 }}
            >
              {data.map((entry) => {
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

        <YAxis
          dataKey={yAxisDataKey}
          type="category"
          tick={<YAxisTick />}
          interval={0}
          orientation={isDesktop ? "left" : "right"}
          mirror={!isDesktop}
        />

        <XAxis
          domain={[0, maxValue]}
          tickCount={Math.floor(maxValue / 10) + 1}
          type="number"
        >
          <Label value="# PiBs" position="bottom" fill="#666" />
        </XAxis>
      </BarChart>
    </ResponsiveContainer>
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

function TooltipContent(props: TooltipProps<number, string>) {
  const { label, payload } = props;
  const dataItem = payload?.[0]?.payload;

  if (!dataItem) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>

      <CardContent>
        <ul>
          {(dataItem as DataItem).audits.map((audit, index) => {
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
