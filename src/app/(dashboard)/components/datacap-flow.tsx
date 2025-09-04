"use client";

import { DCFlowSankey } from "@/components/dc-flow-sankey";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UTCDate } from "@date-fns/utc";
import { padStart } from "lodash";
import { ChangeEventHandler, useCallback, useState } from "react";

const dateInputId = `dc_flow_snapshot_date`;

function getUTCDateString(date: Date = new Date()) {
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]
    .map((part) => padStart(String(part), 2, "0"))
    .join("-");
}

export function DatacapFlow() {
  const [dateInputValue, setDateInputValue] = useState("");

  const handleSnapshotDateValueChange = useCallback<
    ChangeEventHandler<HTMLInputElement>
  >((event) => {
    const dateString = event.target.value;

    if (dateString === "") {
      setDateInputValue(dateString);
      return;
    }

    const date = new UTCDate(dateString);
    const now = new UTCDate();
    const nextDate = date > now ? now : date;

    setDateInputValue(getUTCDateString(nextDate));
  }, []);

  const snapshotDate =
    dateInputValue !== "" ? new UTCDate(dateInputValue) : undefined;

  return (
    <Card
      id="flowCharts"
      className="hidden w-full overflow-hidden h-auto lg:block mb-28"
    >
      <CardHeader>
        <div>
          <CardTitle className="flex-1">Datacap Flow</CardTitle>
          <CardDescription>
            This graph shows live how much DC runs through different
            distribution pathways.
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <label
            className="text-sm text-muted-foreground"
            htmlFor={dateInputId}
          >
            Select snapshot date:
          </label>
          <Input
            id={dateInputId}
            className="w-auto uppercase"
            type="date"
            max={getUTCDateString()}
            value={dateInputValue}
            onChange={handleSnapshotDateValueChange}
          />
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <DCFlowSankey snapshotDate={snapshotDate} />
      </CardContent>
    </Card>
  );
}
