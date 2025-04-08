"use client";
import { useReportsColumns } from "@/app/clients/(pages)/[id]/(pages)/reports/components/useReportsColumns";
import { DataTable } from "@/components/ui/data-table";
import { useMemo, useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import { CardFooter } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { IClientReportsResponse } from "@/lib/interfaces/cdp/cdp.interface";

interface IProps {
  reportsData: IClientReportsResponse;
}

const ReportsTable = ({ reportsData }: IProps) => {
  const { columns } = useReportsColumns();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectedIds = useMemo(() => {
    return Object.keys(rowSelection)
      .map((key) => reportsData?.[+key]?.id)
      .filter((item) => !!item) as string[];
  }, [reportsData, rowSelection]);

  return (
    <div>
      {reportsData && (
        <DataTable
          columns={columns}
          data={reportsData}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      )}
      {selectedIds?.length > 1 && (
        <CardFooter className="border-t w-full p-3 justify-between">
          {selectedIds.length} reports selected
          <Link
            href={`reports/${selectedIds?.sort((a, b) => +a - +b)?.join("/")}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Compare
          </Link>
        </CardFooter>
      )}
    </div>
  );
};

export { ReportsTable };
