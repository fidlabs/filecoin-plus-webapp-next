"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { cn, downloadCSV } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { MouseEventHandler, useCallback, useState } from "react";
import { toast } from "sonner";
import {
  fetchClientLatestClaims,
  FetchClientLatestClaimsReturnType,
} from "../../clients-data";

export interface ClientLatestClaimsCSVExportButtonProps
  extends Omit<ButtonProps, "children"> {
  clientId: string;
  filter?: string;
}

type Entry = FetchClientLatestClaimsReturnType["data"][number];

interface Column {
  label: string;
  key: keyof Entry;
}

const columns: Column[] = [
  { label: "Piece CID", key: "pieceCid" },
  { label: "Storage Provider ID", key: "providerId" },
  { label: "Is DDO", key: "isDDO" },
  { label: "Size", key: "pieceSize" },
  { label: "Date", key: "createdAt" },
];

export function ClientLatestClaimsCSVExportButton({
  className,
  clientId,
  disabled,
  filter,
  onClick,
  ...rest
}: ClientLatestClaimsCSVExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      onClick?.(event);

      try {
        setLoading(true);
        const response = await fetchClientLatestClaims({ clientId, filter });
        const headerString = columns.map((column) => column.label).join(",");
        const allowedKeys = columns.map((column) => column.key);

        const dataString = response.data
          .map((entry) => {
            return allowedKeys
              .map((key) => {
                const value = entry[key];
                if (!!value) {
                  return JSON.stringify(value)
                    .replace(/,/g, " ")
                    .replace(/;/g, " ");
                }
                return "";
              })
              .join(",");
          })
          .join("\r\n");

        const contents = `${headerString}\r\n${dataString}`;
        downloadCSV(`${clientId}_latest_deals.csv`, contents);
      } catch (error) {
        toast.error("Could not download CSV. Try again later.");
      } finally {
        setLoading(false);
      }
    },
    [clientId, filter, onClick]
  );

  return (
    <Button
      variant={"outline"}
      {...rest}
      className={cn("gap-2", className)}
      disabled={disabled || loading}
      onClick={handleClick}
    >
      Export to CSV
      {loading && <LoaderCircle className="animated animate-spin" />}
    </Button>
  );
}
