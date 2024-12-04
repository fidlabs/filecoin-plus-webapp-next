"use client";
import {useClientDetails} from "@/app/clients/(pages)/[id]/components/client.provider";
import {useReportsColumns} from "@/app/clients/(pages)/[id]/(pages)/reports/components/useReportsColumns";
import {DataTable} from "@/components/ui/data-table";
import {useEffect, useMemo, useState} from "react";
import {RowSelectionState} from "@tanstack/react-table";
import {CardFooter} from "@/components/ui/card";
import {buttonVariants} from "@/components/ui/button";
import Link from "next/link";

const ReportsTable = () => {
  const {reportsData} = useClientDetails()

  const {columns} = useReportsColumns()

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  useEffect(() => {
    console.log(rowSelection)
  }, [rowSelection])

  const selectedIds = useMemo(() => {
    return Object.keys(rowSelection).map((key) => reportsData?.[+key]?.id)
  }, [reportsData, rowSelection])

  return <div>
    {reportsData && <DataTable columns={columns} data={reportsData} rowSelection={rowSelection} setRowSelection={setRowSelection}/>}
    {selectedIds?.length > 1 && <CardFooter className="border-t w-full p-3 justify-between">
      {selectedIds.length} reports selected
      <Link href={`reports/${selectedIds?.sort()?.join('/')}`} className={buttonVariants({variant: "outline"})}>
        Compare
      </Link>
    </CardFooter>}
  </div>

}

export {ReportsTable}