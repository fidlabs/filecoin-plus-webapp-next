"use client";

import { DCFlowSankey } from "@/components/dc-flow-sankey";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UTCDate } from "@date-fns/utc";
import { padStart } from "lodash";
import { FullscreenIcon } from "lucide-react";
import {
  type ChangeEventHandler,
  type ComponentProps,
  useCallback,
  useState,
} from "react";

type CardProps = ComponentProps<typeof Card>;
export type DatacapFlowWidgetProps = Omit<CardProps, "children">;

const dateInputId = `dc_flow_snapshot_date`;

function getUTCDateString(date: Date = new Date()) {
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]
    .map((part) => padStart(String(part), 2, "0"))
    .join("-");
}

export function DatacapFlowWidget({
  className,
  ...rest
}: DatacapFlowWidgetProps) {
  const [dateInputValue, setDateInputValue] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setFullscreen((currentFullscreen) => !currentFullscreen);
  }, []);

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
    <Card {...rest} className={cn("hidden lg:block pb-6", className)}>
      <div className="px-4 pt-6 mb-6 gap-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-medium">Datacap Flow</h2>
          <p className="text-xs text-muted-foreground">
            Graph showing how much Datcap runs through different distribution
            pathways.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
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
          <Button
            className="p-3 xl:p-4"
            variant="outline"
            onClick={toggleFullscreen}
          >
            <span className="mr-2 hidden xl:inline-block">Fullscreen</span>
            <FullscreenIcon />
          </Button>
        </div>
      </div>

      <CardContent>
        <DCFlowSankey
          fullscreen={fullscreen}
          snapshotDate={snapshotDate}
          onFullscreenChange={toggleFullscreen}
        />
      </CardContent>
    </Card>
  );
}
