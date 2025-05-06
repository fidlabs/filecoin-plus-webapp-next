"use client";

import { useMemo } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheckIcon, ShieldXIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "usehooks-ts";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ClientReportCheck } from "@/lib/interfaces/cdp/cdp.interface";

export interface HealthCheckProps {
  security: ClientReportCheck[];
}

function ChecksContent({ security }: HealthCheckProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return (
    <div className={cn(!isDesktop && "p-4")}>
      {security.map((item, index) => {
        return (
          <div
            key={index}
            className={cn(
              isDesktop &&
                "flex gap-1 items-center justify-center whitespace-nowrap",
              !isDesktop && "flex gap-1 items-center justify-start mb-1",
              !item.result && "text-destructive"
            )}
          >
            {item.result ? (
              <ShieldCheckIcon className="min-w-8" />
            ) : (
              <ShieldXIcon className="min-w-8" />
            )}
            {item.metadata.msg}
          </div>
        );
      })}
    </div>
  );
}

export function HealthCheck({ security }: HealthCheckProps) {
  const healthCheck = useMemo(() => {
    return security.filter((item) => !item.result).length;
  }, [security]);

  return (
    <>
      <div className="p-4 hidden md:block">
        <HoverCard>
          <HoverCardTrigger>
            <div className="flex gap-2 items-center cursor-help">
              Status:
              <Badge variant={!!healthCheck ? "destructive" : "secondary"}>
                {!!healthCheck
                  ? `${healthCheck} issue${healthCheck > 1 ? "s" : ""}`
                  : "Healthy"}
              </Badge>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-full flex flex-col gap-1 items-start justify-start">
            <ChecksContent security={security} />
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className="p-4 md:hidden">
        <Drawer>
          <DrawerTrigger>
            <div className="flex gap-2 items-center cursor-help">
              Status:
              <Badge variant={!!healthCheck ? "destructive" : "secondary"}>
                {!!healthCheck
                  ? `${healthCheck} issue${healthCheck > 1 ? "s" : ""}`
                  : "Healthy"}
              </Badge>
            </div>
          </DrawerTrigger>
          <DrawerContent>
            <ChecksContent security={security} />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
