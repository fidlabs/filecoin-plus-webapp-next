"use client";

import { ChartLoader } from "@/components/ui/chart-loader";
import { useMediaQuery } from "usehooks-ts";

export default function OldDatacapChartsLoader() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div
      className="flex w-full justify-center items-center"
      style={{
        aspectRatio: isDesktop ? "1.8" : "0.5",
      }}
    >
      <ChartLoader />
    </div>
  );
}
