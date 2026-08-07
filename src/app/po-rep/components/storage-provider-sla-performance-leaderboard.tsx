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
import Link from "next/link";
import { type ReactNode, useState } from "react";

export interface Entry {
  providerId: string;
  scorePercentage: number;
  position: number;
  positionChange: number | undefined;
  group: string;
}

export interface StorageProviderSLAPerformanceLeaderboardProps {
  heading: ReactNode;
  scores: Entry[];
}

const pageSize = 10;
const percentageFormatter = Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

export function StorageProviderSLAPerformanceLeaderboard({
  heading,
  scores,
}: StorageProviderSLAPerformanceLeaderboardProps) {
  const [page, setPage] = useState(1);
  const pageOffset = pageSize * (page - 1);
  const visibleEntries = scores.slice(pageOffset, pageSize * page);

  return (
    <Leaderboard className="flex flex-col">
      <LeaderboardHeader>
        <LeaderboardTitle>{heading}</LeaderboardTitle>
      </LeaderboardHeader>
      <Table className="max-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[1%] text-center">#</TableHead>
            <TableHead className="w-[97%]">Provider</TableHead>
            <TableHead className="w-[1%] text-right">Score</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibleEntries.map((entry, index) => (
            <TableRow key={entry.providerId}>
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
                    <Link href={`/storage-providers/${entry.providerId}/score`}>
                      {entry.providerId}
                    </Link>
                  </Button>
                </LeaderboardText>
                <LeaderboardSubtext>{entry.group}</LeaderboardSubtext>
              </TableCell>

              <TableCell className="w-[1%] text-right">
                <LeaderboardText className="whitespace-nowrap">
                  {percentageFormatter.format(entry.scorePercentage)}
                </LeaderboardText>
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
