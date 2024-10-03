import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getStats} from "@/lib/api";
import {StatsLink} from "@/components/ui/stats-link";

const Stats = async () => {

  const stats = await getStats();

  return <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-evenly">
    <Card>
      <CardHeader>
        <CardTitle>Total Approved Allocators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full flex justify-between">
          <p className="font-semibold textxl">
            {stats?.numberOfAllocators}
          </p>
          <StatsLink href="/allocators?showInactive=true">
            Allocators
          </StatsLink>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Total Active Allocators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full flex justify-between">
          <p className="font-semibold textxl">
            {stats?.numberOfActiveNotariesV2}
          </p>
          <StatsLink href="/allocators?showInactive=true">
            Allocators
          </StatsLink>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Number of clients Served</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full flex justify-between">
          <p className="font-semibold textxl">
            {stats?.numberOfClients}
          </p>
          <StatsLink href="/clients">
            Clients
          </StatsLink>
        </div>
      </CardContent>
    </Card>

  </div>
}

export {Stats}