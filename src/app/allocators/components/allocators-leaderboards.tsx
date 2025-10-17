import { cn, partition } from "@/lib/utils";
import { type HTMLAttributes } from "react";
import { type FetchAllocatorScoreRankingReturnType } from "../allocators-data";
import { AllocatorsLeaderboard } from "./allocators-leaderboard";

export interface AllocatorsLeaderboardsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  scores: FetchAllocatorScoreRankingReturnType;
}

export function AllocatorsLeaderboards({
  className,
  scores,
  style,
  ...rest
}: AllocatorsLeaderboardsProps) {
  const [openDataScores, enterpriseScores] = partition(
    scores,
    (scores) => scores.dataType === "openData"
  );

  return (
    <div
      {...rest}
      className={cn("grid gap-x-4 gap-y-8", className)}
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
        ...style,
      }}
    >
      <AllocatorsLeaderboard
        scores={scores}
        heading="All Allocators Leaderboard"
      />
      <AllocatorsLeaderboard
        scores={openDataScores}
        heading="Open Data Allocators Leaderboard"
      />
      <AllocatorsLeaderboard
        scores={enterpriseScores}
        heading="Enterprise Allocators Leaderboard"
      />
    </div>
  );
}
