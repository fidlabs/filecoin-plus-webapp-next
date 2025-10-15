"use client";

import {
  AllocatorScoringResultRange,
  type AllocatorScoringResult,
} from "@/lib/interfaces/cdp/cdp.interface";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useCallback } from "react";

export interface AllocatorScoreResultChartProps {
  result: AllocatorScoringResult;
}

export function AllocatorScoreResultChart({
  result,
}: AllocatorScoreResultChartProps) {
  const {
    metric_average: maybeAverage,
    metric_value: value,
    metric_unit: unit,
    metric_name: name,
    metric_description: description,
    score,
    metadata,
    metric_value_min: min,
    metric_value_max: max,
    ranges,
  } = result;
  const average = maybeAverage ?? 0;
  const scoreColor = getColorByRange(ranges, score);
  const maxScore = Math.max(...ranges.map((range) => range.score));

  const formatValue = useCallback(
    (value: unknown) => {
      if (typeof value !== "number" && typeof value !== "string") {
        return String(value);
      }

      const numericValue =
        typeof value === "number" ? value : parseFloat(value);
      const valueString = parseFloat(numericValue.toFixed(2)).toString();
      return unit ? valueString + unit : valueString;
    },
    [unit]
  );

  return (
    <article className="bg-white rounded-lg shadow-f-card pb-4 max-w-full">
      <header className="flex justify-between items-top p-4 space-x-4">
        <div className="min-w-0">
          <h5 className="text-md font-semibold mb-1">{name}</h5>
          <p className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
            {description}
          </p>
        </div>

        <div className="flex flex-col items-end space-y-1">
          <div
            className={`flex items-center px-2 pt-1.5 pb-1 rounded-md`}
            style={{
              backgroundColor: scoreColor,
            }}
          >
            <p className="font-semibold text-xs whitespace-nowrap text-white">
              {score} / {maxScore} point{maxScore === 1 ? "" : "s"}
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="text-xs">
                Explain
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{name}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
              </DialogHeader>

              <ul className="list-disc pl-4">
                {metadata.map((metadataText, index) => (
                  <li key={index} className="text-sm mb-1">
                    {metadataText}
                  </li>
                ))}
              </ul>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main>
        <ResponsiveContainer height={90} width="100%">
          <BarChart
            layout="vertical"
            data={[
              {
                average,
                value,
              },
            ]}
            margin={{
              left: 30,
              right: 30,
            }}
          >
            <YAxis type="category" width={0} />
            <XAxis
              type="number"
              domain={[min, max]}
              interval={0}
              fontSize={14}
              tickFormatter={formatValue}
            />
            <Bar
              dataKey="average"
              name="Average"
              fill="#0091ff"
              label={{
                position: "right",
                fontSize: 14,
                formatter: formatValue,
              }}
              minPointSize={5}
            />
            <Bar
              dataKey="value"
              name="Allocator's result"
              fill={scoreColor}
              label={{
                position: "right",
                fontSize: 14,
                formatter: formatValue,
              }}
              minPointSize={5}
            />
            <Legend
              iconSize={12}
              iconType="square"
              wrapperStyle={{
                fontSize: 12,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </main>
    </article>
  );
}

function getColorByRange(
  ranges: AllocatorScoringResultRange[],
  score: number
): string {
  const rangesSorted = ranges.toSorted((a, b) => {
    return a.score - b.score;
  });

  const matchingIndex = rangesSorted.findIndex((range) => {
    return range.score === score;
  });

  if (matchingIndex === rangesSorted.length - 1) {
    // best result
    return "#66a61e";
  } else if (matchingIndex === 0) {
    // worst result
    return "#ff0029";
  } else {
    return "#f2b94f";
  }
}
