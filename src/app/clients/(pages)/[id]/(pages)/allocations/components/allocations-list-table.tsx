"use client";
import { LoaderCircle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { useClientAllocationsColumns } from "@/app/clients/(pages)/[id]/(pages)/allocations/components/useClientAllocationsColumns";
import { useCallback, useMemo, useState } from "react";
import { IClientAllocationsResponse } from "@/lib/interfaces/dmob/client.interface";

interface Sorting {
  key: string;
  direction: "desc" | "asc";
}

interface IProps {
  allocationsData: IClientAllocationsResponse;
}

const AllocationsListTable = ({ allocationsData }: IProps) => {
  const [sorting, setSorting] = useState<Sorting>();

  const handleSort = useCallback((key: string, direction: string) => {
    setSorting({
      key,
      direction: direction === "1" ? "asc" : "desc",
    });
  }, []);

  const { columns } = useClientAllocationsColumns({
    onSort: handleSort,
  });

  const data = useMemo(() => {
    if (!allocationsData) {
      return null;
    }

    const result = allocationsData?.data.flatMap((item) => item.allowanceArray);

    if (!result || !sorting || sorting.key !== "height") {
      return result;
    }

    return [...result].sort((a, b) => {
      return sorting.direction === "asc"
        ? a.height - b.height
        : b.height - a.height;
    });
  }, [allocationsData, sorting]);

  return (
    <div>
      {!data && (
        <div className="p-10 w-full flex flex-col items-center justify-center">
          <LoaderCircle className="animate-spin" />
        </div>
      )}
      {data && <DataTable columns={columns} data={data} />}
    </div>
  );
};

export { AllocationsListTable };
