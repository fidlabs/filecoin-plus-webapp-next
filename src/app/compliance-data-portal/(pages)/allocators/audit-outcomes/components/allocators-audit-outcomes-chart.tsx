"use client";

import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { EditionRoundSelect } from "@/app/compliance-data-portal/components/edition-round-select";
import { AllocatorsAuditOutcomesResponse } from "@/lib/api";
import { useCallback, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartEntry = {
  [K in keyof AllocatorsAuditOutcomesResponse[number]["datacap"]]: number;
} & { month: string };

export interface AllocatorsAuditOutcomesChartProps {
  dataByCount: ChartEntry[];
  dataByDatacap: ChartEntry[];
}

export function AllocatorsAuditOutcomesChart({
  dataByCount,
  dataByDatacap,
}: AllocatorsAuditOutcomesChartProps) {
  const [currentTab, setCurrentTab] = useState("Count");
  const [currentScale, setCurrentScale] = useState("linear");

  const chartData = useMemo(() => {
    const entries = currentTab === "Count" ? dataByCount : dataByDatacap;

    return currentScale === "percent"
      ? entries.map(convertEntryToPercentage)
      : entries;
  }, [currentScale, currentTab, dataByCount, dataByDatacap]);

  const maxValue = useMemo(() => {
    if (currentScale === "percent") {
      return 100;
    }

    return chartData.reduce((max, entry) => {
      return Math.max(max, getEntryTotal(entry));
    }, 0);
  }, [chartData, currentScale]);

  const formatValue = useCallback(
    (value: number) => {
      if (currentScale === "percent") {
        return Math.round(value) + "%";
      }

      return currentTab === "Count"
        ? String(value)
        : value + " PiB" + (value === 1 ? "" : "s");
    },
    [currentScale, currentTab]
  );

  return (
    <ChartWrapper
      title="Governance Compliance Audit Outcomes"
      id="AuditOutcomesAllocator"
      tabs={["Count", "PiB"]}
      scales={["linear", "percent"]}
      currentTab={currentTab}
      selectedScale={currentScale}
      setCurrentTab={setCurrentTab}
      setSelectedScale={setCurrentScale}
      additionalFilters={[<EditionRoundSelect key="edition-round-select" />]}
    >
      <ResponsiveContainer width="100%" height={chartData.length * 30 + 80}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            bottom: 40,
          }}
        >
          <Tooltip formatter={formatValue} />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar
            dataKey="unknown"
            stackId="month"
            fill="#525252"
            name="Unknown"
          />
          <Bar dataKey="failed" stackId="month" fill="#ff0029" name="Failed" />
          <Bar
            dataKey="passedConditionally"
            stackId="month"
            fill="#cf8c00"
            name="Passed Conditionally"
          />
          <Bar dataKey="passed" stackId="month" fill="#66a61e" name="Passed" />
          <Bar
            dataKey="notAudited"
            stackId="month"
            fill="#888"
            name="Not Audited"
          />
          <YAxis dataKey="month" type="category" interval={0} fontSize={14} />
          <XAxis
            type="number"
            tickFormatter={formatValue}
            domain={[0, maxValue]}
          />
          <Legend
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{
              fontSize: 12,
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      <div>
        <h5 className="text-sm font-semibold mb-2">What is this chart?</h5>
        <p className="text-sm mb-1">
          The Fil+ Governance Team conducts audits of the Allocators when an
          Allocator is at 75% of DataCap tranche usage. Based on the historical
          behaviour of the Allocator, the team decides the size of the next
          allocation of Data Cap:
        </p>
        <ul className="text-sm list-disc">
          <li className="ml-4">
            If the Allocator showed compliance, they will receive the same or
            double the previous DataCap allocation.
          </li>
          <li className="ml-4">
            If the Allocator breached some of their rules, the Governance Team
            may decide they are partially compliant and allocate half of the
            previous allocation, giving an Allocator a chance to build up trust
            again.
          </li>
          <li className="ml-4">
            If the Allocator exhibited gross misconduct, they will be deemed
            non-compliant and will not receive any more DataCap.
          </li>
          <li className="ml-4">
            Non audited Allocators have not yet used up their initial 5PiBs of
            DataCap allocation
          </li>
        </ul>
      </div>
    </ChartWrapper>
  );
}

function getEntryTotal(entry: ChartEntry): number {
  return Object.entries(entry).reduce((total, [key, value]) => {
    if (key === "month" || typeof value !== "number") {
      return total;
    }

    return total + value;
  }, 0);
}

function safeToPercentage(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }

  return (numerator / denominator) * 100;
}

function convertEntryToPercentage(entry: ChartEntry): ChartEntry {
  const total = getEntryTotal(entry);

  return {
    month: entry.month,
    unknown: entry.unknown ? safeToPercentage(entry.unknown, total) : undefined,
    failed: entry.failed ? safeToPercentage(entry.failed, total) : undefined,
    passedConditionally: entry.passedConditionally
      ? safeToPercentage(entry.passedConditionally, total)
      : undefined,
    passed: entry.passed ? safeToPercentage(entry.passed, total) : undefined,
    notAudited: entry.notAudited
      ? safeToPercentage(entry.notAudited, total)
      : undefined,
  };
}
