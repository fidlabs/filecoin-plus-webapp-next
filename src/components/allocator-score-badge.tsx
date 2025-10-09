import { AllocatorScoringResult } from "@/lib/interfaces/cdp/cdp.interface";
import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

type BaseProps = Omit<HTMLAttributes<HTMLDivElement>, "children">;
export interface AllocatorScoreBadgeProps extends BaseProps {
  averageScore?: number | null;
  scoringResults: AllocatorScoringResult[];
  size?: number;
  thickness?: number;
}

export function AllocatorScoreBadge({
  averageScore,
  className,
  scoringResults,
  size = 96,
  style,
  thickness = 4,
  ...rest
}: AllocatorScoreBadgeProps) {
  const [totalScore, maxTotalScore] = scoringResults?.reduce(
    ([currentTotalScore, currentMaxTotalScore], result) => {
      const maxScore = Math.max(...result.ranges.map((range) => range.score));

      return [
        currentTotalScore + result.score,
        currentMaxTotalScore + maxScore,
      ];
    },
    [0, 0]
  );

  const circleRadius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * circleRadius;
  const ratio = maxTotalScore !== 0 ? totalScore / maxTotalScore : 0;
  const averageRatio =
    typeof averageScore === "number" && maxTotalScore !== 0
      ? averageScore / maxTotalScore
      : 0;

  return (
    <div
      {...rest}
      className={cn(
        "relative flex items-center justify-center text-2xl font-semibold",
        className
      )}
      style={{
        height: size,
        width: size,
        ...style,
      }}
    >
      <svg
        className="absolute top-0 left-0"
        height={size}
        width={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={circleRadius}
          fill="none"
          stroke="#d1d5db"
          strokeWidth={thickness}
        />

        <circle
          className="-rotate-90 origin-center"
          cx={size / 2}
          cy={size / 2}
          r={circleRadius}
          fill="none"
          stroke="#aaa"
          strokeWidth={thickness}
          strokeDasharray={`${circumference * averageRatio} ${circumference * (1 - averageRatio)}`}
        />

        <circle
          className="-rotate-90 origin-center"
          cx={size / 2}
          cy={size / 2}
          r={circleRadius}
          fill="none"
          stroke="#0091ff"
          strokeWidth={thickness}
          strokeDasharray={`${circumference * ratio} ${circumference * (1 - ratio)}`}
        />
      </svg>
      <span className="text-center">
        {totalScore}
        <span className="block text-xs text-gray-400">
          Out of {maxTotalScore}
        </span>
      </span>
    </div>
  );
}
