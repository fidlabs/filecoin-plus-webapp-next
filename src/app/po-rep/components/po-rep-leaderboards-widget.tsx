import { cn } from "@/lib/utils";
import { groupBy } from "lodash";
import { type HTMLAttributes } from "react";
import {
  Entry,
  StorageProviderSLAPerformanceLeaderboard,
} from "./storage-provider-sla-performance-leaderboard";

export type PoRepLeaderboardsWidgetProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
>;

type BaseEntry = Omit<Entry, "position" | "positionChange">;

const groups = ["Group 1", "Group 2"];

function baseEntriesToEntries(input: BaseEntry[]): Entry[] {
  return input
    .toSorted((a, b) => {
      return b.scorePercentage - a.scorePercentage;
    })
    .map<Entry>((baseEntry, index) => {
      return {
        ...baseEntry,
        position: index + 1,
        positionChange:
          Math.random() > 0.7
            ? Math.round(Math.random() * 3) * (Math.random() > 0.5 ? 1 : -1)
            : 0,
      };
    });
}

function generateData(): [Entry[], ...Entry[][]] {
  const baseEntries = [...new Array(100)].map<BaseEntry>((_, index) => {
    return {
      providerId: "f0" + String(index).padStart(5, "0"),
      group: groups[Math.floor(Math.random() * groups.length)],
      scorePercentage: Math.random(),
    };
  });

  const groupedEntries = groupBy(baseEntries, (entry) => entry.group);

  return [
    baseEntriesToEntries(baseEntries),
    ...Object.values(groupedEntries).map(baseEntriesToEntries),
  ];
}

const groupedData = generateData();

export function PoRepLeaderboardsWidget({
  className,
  style,
  ...rest
}: PoRepLeaderboardsWidgetProps) {
  return (
    <div
      {...rest}
      className={cn("grid gap-x-4 gap-y-8", className)}
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(min(400px, 100%), 1fr))",
        ...style,
      }}
    >
      {groupedData.map((entries, index) => {
        const heading =
          index === 0
            ? "All Providers Leaderboard"
            : `${entries[0]?.group ?? groups[index - 1]} Leaderboard`;

        return (
          <StorageProviderSLAPerformanceLeaderboard
            key={index}
            heading={heading}
            scores={entries}
          />
        );
      })}
    </div>
  );
}
