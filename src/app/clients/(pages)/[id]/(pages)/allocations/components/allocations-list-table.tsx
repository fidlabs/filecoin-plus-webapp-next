"use client";
import { LoaderCircle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { useClientAllocationsColumns } from "@/app/clients/(pages)/[id]/(pages)/allocations/components/useClientAllocationsColumns";
import { useMemo } from "react";
import { IClientAllocationsResponse } from "@/lib/interfaces/dmob/client.interface";

interface IProps {
  allocationsData: IClientAllocationsResponse;
}

const AllocationsListTable = ({ allocationsData }: IProps) => {
  const { columns } = useClientAllocationsColumns();

  const data = useMemo(() => {
    if (!allocationsData) {
      return null;
    }

    return allocationsData?.data.flatMap((item) => item.allowanceArray);
  }, [allocationsData]);

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
