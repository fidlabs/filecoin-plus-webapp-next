import Link from "next/link";
import { convertBytesToIEC } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { IClientDeal } from "@/lib/interfaces/dmob/client.interface";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export const useDataCapClaimsColumns = () => {
  const columns = [
    {
      accessorKey: "pieceCid",
      header: () => {
        return <div>Piece CID</div>;
      },
      cell: ({ row }) => {
        const pieceCid = row.getValue("pieceCid") as string;
        return (
          <>
            <HoverCard>
              <HoverCardTrigger>
                <p className="sm:hidden">
                  {pieceCid.substring(0, 5)}...{pieceCid.slice(-5)}
                </p>
                <p className="hidden sm:block md:hidden">
                  {pieceCid.substring(0, 10)}...{pieceCid.slice(-10)}
                </p>
              </HoverCardTrigger>
              <HoverCardContent>
                <p className="break-words">{pieceCid}</p>
              </HoverCardContent>
            </HoverCard>
            <p className="hidden md:block">{pieceCid}</p>
          </>
        );
      },
    },
    {
      accessorKey: "providerId",
      header: () => {
        return <div>Storage Provider ID</div>;
      },
      cell: ({ row }) => {
        const providerId = `f0${row.getValue("providerId")}` as string;
        return (
          <Link
            className="table-link"
            href={`/storage-providers/${providerId}`}
          >
            {providerId}
          </Link>
        );
      },
    },
    {
      accessorKey: "pieceSize",
      header: () => {
        return <div>Size</div>;
      },
      cell: ({ row }) => {
        const pieceSize = row.getValue("pieceSize") as string;
        return <p>{convertBytesToIEC(pieceSize)}</p>;
      },
    },
    {
      accessorKey: "createdAt",
      header: () => {
        return <div>Date</div>;
      },
      cell: ({ row }) => {
        const createDate = new Date(row.getValue("createdAt"));
        return <p>{createDate.toLocaleString()}</p>;
      },
    },
  ] as ColumnDef<IClientDeal>[];

  const csvHeaders = [
    { label: "Piece CID", key: "pieceCid" },
    { label: "Storage Provider ID", key: "providerId" },
    { label: "Size", key: "pieceSize" },
    { label: "Date", key: "createdAt" },
  ];

  return { columns, csvHeaders };
};
