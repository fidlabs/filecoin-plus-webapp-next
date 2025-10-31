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
import { type ReactNode, useMemo, useState } from "react";

type AllocatorScore = FetchAllocatorScoreRankingReturnType[number];
type Entry = AllocatorScore & {
  positionChange: number;
};

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

  const entries = useMemo<Entry[]>(() => {
    const lastWeekSorted = scores.toSorted((a, b) => {
      return (
        parseFloat(b.weekAgoScorePercentage) -
        parseFloat(a.weekAgoScorePercentage)
      );
    });

    return scores.map((score, index) => {
      const currentPosition = index + 1;
      const previousPosition =
        lastWeekSorted.findIndex((candidate) => {
          return candidate.allocatorId === score.allocatorId;
        }) + 1;

      return {
        ...score,
        positionChange: previousPosition - currentPosition,
      };
    });
  }, [scores]);
  const visibleEntries = entries.slice(pageOffset, pageSize * page);
  console.log(
    "DEBUG",
    entries.filter((entry) => entry.positionChange !== 0)
  );

  return (
    <Leaderboard className="flex flex-col">
      <LeaderboardHeader>
        <LeaderboardTitle>{heading}</LeaderboardTitle>
      </LeaderboardHeader>
      <LeaderboardList>
        {visibleEntries.map((entry, index) => (
          <LeaderboardItem
            key={entry.allocatorId}
            position={pageOffset + index + 1}
            positionChange={entry.positionChange}
          >
            <div className="flex items-center justify-between gap-x-4">
              <div className="min-w-0">
                <LeaderboardText className="whitespace-nowrap overflow-hidden text-ellipsis">
                  <Button asChild variant="link" className="inline">
                    <Link href={`/allocators/${entry.allocatorId}/score`}>
                      {entry.allocatorName}
                    </Link>
                  </Button>
                </LeaderboardText>
                <LeaderboardSubtext>
                  {dataTypeDict[entry.dataType]}
                </LeaderboardSubtext>
              </div>

              <div>
                <LeaderboardText className="text-right">
                  {percentageFormatter.format(
                    parseFloat(entry.scorePercentage) / 100
                  )}
                </LeaderboardText>
                <LeaderboardSubtext className="text-right whitespace-nowrap">
                  {entry.totalScore} / {entry.maxPossibleScore} points
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
