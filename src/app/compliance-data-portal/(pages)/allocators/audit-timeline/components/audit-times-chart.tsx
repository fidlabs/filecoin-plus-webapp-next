"use client";

import { ChartWrapper } from "@/app/compliance-data-portal/components/chart-wrapper";
import { EditionRoundSelect } from "@/app/compliance-data-portal/components/edition-round-select";
import { palette } from "@/lib/utils";
import { useCallback, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartEntry {
  name: string;
  averageAllocationTimeSecs?: number;
  averageAuditTimeSecs?: number;
  averageConversationTimeSecs?: number;
}

export interface AuditTimeChartProps {
  chartDataByRound: ChartEntry[];
  chartDataByMonth: ChartEntry[];
}

const oneDayInSeconds = 60 * 60 * 24;
const tabs = ["Audit", "Month"];

export function AuditTimeChart({
  chartDataByRound,
  chartDataByMonth,
}: AuditTimeChartProps) {
  const [tab, setTab] = useState(tabs[0]);

  const chartData = tab === "Audit" ? chartDataByRound : chartDataByMonth;
  const maxValue = useMemo(() => {
    return chartData.reduce((max, entry) => {
      const values = Object.values(entry).filter(
        (value) => typeof value === "number"
      );
      return Math.max(max, ...values);
    }, 0);
  }, [chartData]);

  const formatValue = useCallback((value: number) => {
    const days = Math.ceil(value / oneDayInSeconds);

    return `${days}\u00A0day${days === 1 ? "" : "s"}`;
  }, []);

  return (
    <ChartWrapper
      title="Governance Compliance Audit Timeline"
      tabs={tabs}
      currentTab={tab}
      setCurrentTab={setTab}
      additionalFilters={[<EditionRoundSelect key="edition-round-select" />]}
    >
      <ResponsiveContainer
        width="100%"
        height={tab === "Audit" ? 500 : chartData.length * 60 + 60}
      >
        <BarChart
          data={chartData}
          layout={tab === "Month" ? "vertical" : "horizontal"}
        >
          <Tooltip formatter={formatValue} />
          <CartesianGrid strokeDasharray="3 3" />

          <Bar
            dataKey="averageAllocationTimeSecs"
            name="Average Allocation Time"
            fill={palette(3)}
            stroke="#000"
          />
          <Bar
            dataKey="averageAuditTimeSecs"
            name="Average Audit Time"
            fill={palette(4)}
            stroke="#000"
          />
          <Bar
            dataKey="averageConversationTimeSecs"
            name="Average Conversation Time"
            fill={palette(5)}
            stroke="#000"
          />

          {tab === "Audit" ? (
            <>
              <XAxis
                dataKey="name"
                type="category"
                interval={0}
                fontSize={14}
              />
              <YAxis tickFormatter={formatValue} fontSize={14} />
            </>
          ) : (
            <>
              <YAxis
                dataKey="name"
                type="category"
                interval={0}
                fontSize={14}
              />
              <XAxis
                type="number"
                tickFormatter={formatValue}
                domain={[0, maxValue]}
                fontSize={14}
              />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
