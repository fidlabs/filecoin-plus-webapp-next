"use client";

import { OverlayLoader } from "@/components/overlay-loader";
import { Card } from "@/components/ui/card";
import {
  fetchAllocatorsAuditStates,
  FetchAllocatorsAuditStatesParameters,
} from "@/lib/api";
import { QueryKey } from "@/lib/constants";
import { useDelayedFlag } from "@/lib/hooks/use-delayed-flag";
import { cn } from "@/lib/utils";
import { useCallback, useState, type ComponentProps } from "react";
import useSWR from "swr";
import { AuditsFlowSankey } from "./audits-flow-sankey";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CardProps = ComponentProps<typeof Card>;
export interface AuditsFlowWidgetProps extends Omit<CardProps, "children"> {
  defaultParameters?: FetchAllocatorsAuditStatesParameters;
}

export function AuditsFlowWidget({
  className,
  defaultParameters,
  ...rest
}: AuditsFlowWidgetProps) {
  const [parameters, setParameters] = useState(
    defaultParameters ?? { editionId: "6" }
  );
  const { data, isLoading } = useSWR(
    [QueryKey.ALLOCATORS_AUDIT_STATES, parameters],
    ([, fetchParameters]) => fetchAllocatorsAuditStates(fetchParameters),
    {
      keepPreviousData: true,
      revalidateOnMount: false,
    }
  );
  const isLongLoading = useDelayedFlag(isLoading, 1000);

  const handleEditionChange = useCallback((editionId: string) => {
    setParameters((currentParameters) => ({
      ...currentParameters,
      editionId,
    }));
  }, []);

  return (
    <Card {...rest} className={cn("pb-6", className)}>
      <div className="px-4 pt-6 mb-2 gap-4 flex flex-wrap items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Audits Flow</h2>
          <p className="text-xs text-muted-foreground">
            Allocators audits of Fil+ program
          </p>
        </div>

        <Select
          value={parameters.editionId}
          onValueChange={handleEditionChange}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="All Editions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Edition 5</SelectItem>
            <SelectItem value="6">Edition 6</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="relative">
        <AuditsFlowSankey data={data ?? []} />
        <OverlayLoader show={!data || isLongLoading} />
      </div>
    </Card>
  );
}
