"use client";

import { ChartTooltip } from "@/components/chart-tooltip";
import { useCallback } from "react";
import {
  Bar,
  BarChart,
  BarProps,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DataItem {
  date: string;
  passed: number;
  passedChange: number;
  failed: number;
  failedChange: number;
}

export interface ChecksChartProps {
  data: DataItem[];
  formatDate?(date: string): string;
  onBarClick?: BarProps["onClick"];
}

const passColor = "#66a61e";
const passColorAlt = "rgba(102, 166, 30, 0.5)";
const failColor = "#ff0029";
const failColorAlt = "rgba(255, 0, 41, 0.5)";

export function ChecksChart({
  data,
  formatDate,
  onBarClick,
}: ChecksChartProps) {
  const getXAxisDataKey = useCallback(
    (dataItem: DataItem) => {
      return formatDate ? formatDate(dataItem.date) : dataItem.date;
    },
    [formatDate]
  );

  const getPassedChecks = useCallback((dataItem: DataItem) => {
    return dataItem.passed - Math.max(0, dataItem.passedChange);
  }, []);

  const getPassedChecksChange = useCallback((dataItem: DataItem) => {
    return Math.max(0, dataItem.passedChange);
  }, []);

  const getFailedChecks = useCallback((dataItem: DataItem) => {
    return dataItem.failed - Math.max(0, dataItem.failedChange);
  }, []);

  const getFailedChecksChange = useCallback((dataItem: DataItem) => {
    return Math.max(0, dataItem.failedChange);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300} debounce={500}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={getXAxisDataKey} fontSize={14} />
        <YAxis fontSize={14} />
        <Tooltip content={ChartTooltip} />

        <Bar
          stackId="passed"
          name="Passed Checks Increase"
          dataKey={getPassedChecksChange}
          barSize={20}
          fill={passColor}
          style={{
            cursor: onBarClick ? "pointer" : "default",
            stroke: passColor,
            strokeWidth: 1,
          }}
          onClick={onBarClick}
        />
        <Bar
          stackId="passed"
          name="Passed Checks"
          dataKey={getPassedChecks}
          barSize={20}
          fill={passColorAlt}
          style={{
            cursor: onBarClick ? "pointer" : "default",
            stroke: passColor,
            strokeWidth: 1,
          }}
          onClick={onBarClick}
        />

        <Bar
          stackId="failed"
          name="Failed Checks Increase"
          dataKey={getFailedChecksChange}
          barSize={20}
          fill={failColor}
          style={{
            cursor: onBarClick ? "pointer" : "default",
            stroke: failColor,
            strokeWidth: 1,
          }}
          onClick={onBarClick}
        />
        <Bar
          stackId="failed"
          name="Failed Checks"
          dataKey={getFailedChecks}
          barSize={20}
          fill={failColorAlt}
          style={{
            cursor: onBarClick ? "pointer" : "default",
            stroke: failColor,
            strokeWidth: 1,
          }}
          onClick={onBarClick}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
