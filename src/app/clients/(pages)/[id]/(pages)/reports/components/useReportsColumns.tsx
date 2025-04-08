import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { IClientReportHeader } from "@/lib/interfaces/cdp/cdp.interface";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

export const useReportsColumns = () => {
  const columns = [
    {
      id: "select",
      size: 40,
      cell: ({ row }) => (
        <Checkbox
          checked={row?.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: () => {
        return <div>Report ID</div>;
      },
      cell: ({ row }) => {
        const reportId = row.getValue("id") as string;
        return (
          <Link className="table-link" href={`reports/${reportId}`}>
            {reportId}
          </Link>
        );
      },
    },
    {
      accessorKey: "create_date",
      header: () => {
        return <div>Created at</div>;
      },
      cell: ({ row }) => {
        const create_date = row.getValue("create_date") as string;
        return <p>{format(new Date(create_date), "yyyy-MM-dd HH:mm")}</p>;
      },
    },
  ] as ColumnDef<IClientReportHeader>[];

  return { columns };
};
