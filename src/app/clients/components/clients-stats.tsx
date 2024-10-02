import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {convertBytesToIEC} from "@/lib/utils";
import {IClientsResponse} from "@/lib/interfaces/dmob/client.interface";


interface ClientsStatsProps {
  data: IClientsResponse
}
const ClientsStats = ({data}: ClientsStatsProps) => {
  return <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 content-evenly">
    <Card>
      <CardHeader>
        <CardTitle>Filecoin clients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full flex justify-between">
          <p className="font-semibold textxl">
            {data?.count}
          </p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Total remaining DataCap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full flex justify-between">
          <p className="font-semibold textxl">
            {convertBytesToIEC(data?.totalRemainingDatacap ?? 0)}
          </p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Clients With Active Deals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full flex justify-between">
          <p className="font-semibold textxl">
            {data?.clientsWithActiveDeals}
          </p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Clients with active deals and Remaining DataCap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full flex justify-between">
          <p className="font-semibold textxl">
            {data?.countOfClientsWhoHaveDcAndDeals}
          </p>
        </div>
      </CardContent>
    </Card>

  </div>
}

export {ClientsStats}
