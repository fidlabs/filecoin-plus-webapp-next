import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, convertBytesToIEC } from "@/lib/utils";
import { FetchClientsReturnType } from "../clients-data";
import { HTMLAttributes } from "react";

export interface ClientsStatsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  data: FetchClientsReturnType;
}

export default function ClientsStats({
  className,
  data,
  ...rest
}: ClientsStatsProps) {
  return (
    <div
      {...rest}
      className={cn(
        "w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 content-evenly",
        className
      )}
    >
      <Card>
        {!data && <Skeleton className="h-[110px] w-full rounded-lg" />}
        {!!data && (
          <>
            <CardHeader>
              <CardTitle>Filecoin Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full flex justify-between">
                <p className="font-semibold textxl">{data.numberOfClients}</p>
              </div>
            </CardContent>
          </>
        )}
      </Card>
      <Card>
        {!data && <Skeleton className="h-[110px] w-full rounded-lg" />}
        {!!data && (
          <>
            <CardHeader>
              <CardTitle>Total Remaining DataCap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full flex justify-between">
                <p className="font-semibold textxl">
                  {convertBytesToIEC(data.totalRemainingDatacap)}
                </p>
              </div>
            </CardContent>
          </>
        )}
      </Card>
      <Card>
        {!data && <Skeleton className="h-[110px] w-full rounded-lg" />}
        {!!data && (
          <>
            <CardHeader>
              <CardTitle>Clients With Active Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full flex justify-between">
                <p className="font-semibold textxl">
                  {data.clientsWithActiveDeals}
                </p>
              </div>
            </CardContent>
          </>
        )}
      </Card>
      <Card>
        {!data && <Skeleton className="h-[110px] w-full rounded-lg" />}
        {!!data && (
          <>
            <CardHeader>
              <CardTitle>
                Clients With Active Deals and Remaining DataCap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full flex justify-between">
                <p className="font-semibold textxl">
                  {data.countOfClientsWhoHaveDcAndDeals}
                </p>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
