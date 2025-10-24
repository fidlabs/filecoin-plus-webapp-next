"use client";

import {
  Leaderboard,
  LeaderboardHeader,
  LeaderboardItem,
  LeaderboardList,
  LeaderboardPagination,
  LeaderboardSubtext,
  LeaderboardText,
  LeaderboardTitle,
} from "@/components/leaderboard";
import { type FetchAllocatorScoreRankingReturnType } from "../allocators-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { type ReactNode, useState } from "react";

export interface AllocatorsLeaderboardProps {
  heading: ReactNode;
  scores: FetchAllocatorScoreRankingReturnType;
}

const dataTypeDict: Record<
  FetchAllocatorScoreRankingReturnType[number]["dataType"],
  string
> = {
  enterprise: "Enterprise",
  openData: "Open Data",
};

const pageSize = 10;
const percentageFormatter = Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

export function AllocatorsLeaderboard({
  heading,
  scores,
}: AllocatorsLeaderboardProps) {
  const [page, setPage] = useState(1);
  const pageOffset = pageSize * (page - 1);
  const visibleScores = scores.slice(pageOffset, pageSize * page);

  return (
    <Leaderboard className="flex flex-col">
      <LeaderboardHeader>
        <LeaderboardTitle>{heading}</LeaderboardTitle>
      </LeaderboardHeader>
      <LeaderboardList>
        {visibleScores.map((score, index) => (
          <LeaderboardItem
            key={score.allocatorId}
            position={pageOffset + index + 1}
          >
            <div className="flex items-center justify-between gap-x-4">
              <div className="min-w-0">
                <LeaderboardText className="whitespace-nowrap overflow-hidden text-ellipsis">
                  <Button asChild variant="link">
                    <Link href={`/allocators/${score.allocatorId}/score`}>
                      {score.allocatorName}
                    </Link>
                  </Button>
                </LeaderboardText>
                <LeaderboardSubtext>
                  {dataTypeDict[score.dataType]}
                </LeaderboardSubtext>
              </div>

              <div>
                <LeaderboardText className="text-right">
                  {percentageFormatter.format(
                    parseFloat(score.scorePercentage) / 100
                  )}
                </LeaderboardText>
                <LeaderboardSubtext className="text-right whitespace-nowrap">
                  {score.totalScore} / {score.maxPossibleScore} points
                </LeaderboardSubtext>
              </div>
            </div>
          </LeaderboardItem>
        ))}
      </LeaderboardList>
      <LeaderboardPagination
        className="mt-auto"
        page={page}
        pageSize={pageSize}
        total={scores.length}
        onPageChange={setPage}
      />
    </Leaderboard>
  );
}
