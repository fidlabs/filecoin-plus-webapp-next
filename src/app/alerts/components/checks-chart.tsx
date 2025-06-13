"use client";

import { useCallback } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DataItem {
  date: string;
  passed: number;
  failed: number;
}

interface BarData extends DataItem {
  payload: DataItem;
  [key: string]: unknown;
}

export interface ChecksChartProps {
  data: DataItem[];
  formatDate?(date: string): string;
  onBarClick?(barData: BarData): void;
}

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

  return (
    <ResponsiveContainer width="100%" height={300} debounce={500}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={getXAxisDataKey} />
        <YAxis />
        <Tooltip />
        <Bar
          name="Passed Checks"
          dataKey="passed"
          barSize={20}
          fill="#66a61e"
          style={{
            cursor: onBarClick ? "pointer" : "default",
          }}
          onClick={onBarClick}
        />
        <Bar
          name="Failed Checks"
          dataKey="failed"
          barSize={20}
          fill="#ff0029"
          style={{
            cursor: onBarClick ? "pointer" : "default",
          }}
          onClick={onBarClick}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
