"use client";

import {
  Leaderboard,
  LeaderboardHeader,
  LeaderboardPagination,
  LeaderboardPositionBadge,
  LeaderboardSubtext,
  LeaderboardText,
  LeaderboardTitle,
} from "@/components/leaderboard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { groupBy } from "@/lib/utils";
import { filesize } from "filesize";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { type FetchAllocatorScoreRankingReturnType } from "../allocators-data";

type AllocatorScore = FetchAllocatorScoreRankingReturnType[number];
type Entry = Pick<
  AllocatorScore,
  | "allocatorId"
  | "allocatorName"
  | "dataType"
  | "scorePercentage"
  | "totalScore"
  | "maxPossibleScore"
  | "totalDatacap"
> & {
  position: number;
  positionChange: number | undefined;
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
    const currentWeekGroups = Object.entries(
      groupBy(scores, (score) => score.scorePercentage)
    )
      .sort(([aScorePercentage], [bScorePercentage]) => {
        return parseFloat(bScorePercentage) - parseFloat(aScorePercentage);
      })
      .map(([, gropScores]) => gropScores);

    const lastWeekGroups = Object.entries(
      groupBy(scores, (score) => score.weekAgoScorePercentage)
    )
      .sort(([aScorePercentage], [bScorePercentage]) => {
        return parseFloat(bScorePercentage) - parseFloat(aScorePercentage);
      })
      .map(([, gropScores]) => gropScores);

    return scores
      .map<Entry>((score) => {
        const groupIndex = currentWeekGroups.findIndex((group) => {
          return (
            !!group &&
            group.some(
              (candidate) => candidate.allocatorId === score.allocatorId
            )
          );
        });
        const lastWeekGroupIndex = lastWeekGroups.findIndex((group) => {
          return (
            !!group &&
            group.some(
              (candidate) => candidate.allocatorId === score.allocatorId
            )
          );
        });

        const position = groupIndex + 1;
        const positionChange =
          lastWeekGroupIndex !== -1
            ? lastWeekGroupIndex + 1 - position
            : undefined;

        return {
          ...score,
          position,
          positionChange,
        };
      })
      .sort((a, b) => {
        if (a.position === b.position) {
          if (a.totalDatacap === null) {
            return 1;
          }

          if (b.totalDatacap === null) {
            return -1;
          }

          return BigInt(a.totalDatacap) > BigInt(b.totalDatacap) ? -1 : 1;
        }

        return a.position - b.position;
      });
  }, [scores]);
  const visibleEntries = entries.slice(pageOffset, pageSize * page);

  return (
    <Leaderboard className="flex flex-col">
      <LeaderboardHeader>
        <LeaderboardTitle>{heading}</LeaderboardTitle>
      </LeaderboardHeader>
      <Table className="max-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[1%] text-center">#</TableHead>
            <TableHead className="w-[97%]">Allocator</TableHead>
            <TableHead className="w-[1%] text-right">Datacap</TableHead>
            <TableHead className="w-[1%] text-right">Score</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibleEntries.map((entry, index) => (
            <TableRow key={entry.allocatorId}>
              <TableCell className="w-[1%]">
                <LeaderboardPositionBadge
                  exAequo={
                    index !== 0 &&
                    visibleEntries[index - 1].position === entry.position
                  }
                  position={entry.position}
                  positionChange={entry.positionChange}
                />
              </TableCell>

              <TableCell className="w-[97%] max-w-0 overflow-hidden">
                <LeaderboardText className="max-w-full whitespace-nowrap overflow-hidden text-ellipsis">
                  <Button asChild variant="link" className="inline">
                    <Link href={`/allocators/${entry.allocatorId}/score`}>
                      {entry.allocatorName}
                    </Link>
                  </Button>
                </LeaderboardText>
                <LeaderboardSubtext>
                  {dataTypeDict[entry.dataType]}
                </LeaderboardSubtext>
              </TableCell>

              <TableCell className="w-[1%] text-right">
                <LeaderboardText className="whitespace-nowrap">
                  {entry.totalDatacap !== null
                    ? filesize(entry.totalDatacap, {
                        standard: "iec",
                      }).toString()
                    : "N/A"}
                </LeaderboardText>
              </TableCell>

              <TableCell className="w-[1%] text-right">
                <LeaderboardText className="whitespace-nowrap">
                  {percentageFormatter.format(
                    parseFloat(entry.scorePercentage) / 100
                  )}
                </LeaderboardText>
                <LeaderboardSubtext className="whitespace-nowrap">
                  {entry.totalScore} / {entry.maxPossibleScore} pts
                </LeaderboardSubtext>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
