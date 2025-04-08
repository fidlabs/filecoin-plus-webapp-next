import Link from "next/link";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { calculateDateFromHeight, convertBytesToIEC } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { IAllowanceArray } from "@/lib/interfaces/dmob/dmob.interface";

export const useClientAllocationsColumns = () => {
  const columns = [
    {
      accessorKey: "verifierAddressId",
      header: () => {
        return <div>Allocator ID</div>;
      },
      cell: ({ row }) => {
        const verifierAddressId = row.getValue("verifierAddressId") as string;
        return (
          <Link
            className="table-link"
            href={`/allocators/${verifierAddressId}`}
          >
            {verifierAddressId}
          </Link>
        );
      },
    },
    {
      accessorKey: "allowance",
      header: () => {
        return <div>Total size</div>;
      },
      cell: ({ row }) => {
        const allowance = row.getValue("allowance") as string;
        return convertBytesToIEC(allowance);
      },
    },
    {
      accessorKey: "height",
      header: () => {
        return <div>Allocation date</div>;
      },
      cell: ({ row }) => {
        const height = row.getValue("height") as string;
        return (
          <div className="whitespace-nowrap flex gap-1 items-center w-min">
            {calculateDateFromHeight(+height)}
            <HoverCard openDelay={100} closeDelay={50}>
              <HoverCardTrigger>
                <InfoIcon
                  size={15}
                  className="text-muted-foreground cursor-help"
                />
              </HoverCardTrigger>
              <HoverCardContent className="w-32">
                <p>Block height</p>
                <p>{height}</p>
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      },
    },
  ] as ColumnDef<IAllowanceArray>[];

  return { columns };
};
