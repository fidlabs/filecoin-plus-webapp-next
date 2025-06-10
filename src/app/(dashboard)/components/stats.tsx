import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchAllocatorsDailyReportChecks,
  fetchAllocatorsReportChecksDays,
  getStats,
} from "@/lib/api";
import { StatsLink } from "@/components/ui/stats-link";
import { memo } from "react";

export const revalidate = 300;

const Component = async () => {
  const [stats, alertsCount] = await Promise.all([
    getStats(),
    fetchAllocatorsDailyReportChecks().then((response) => {
      return response.results.reduce((total, result) => {
        return total + result.checksFailedCount;
      }, 0);
    }),
  ]);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 content-evenly">
      <Card>
        <CardHeader>
          <CardTitle>Total Approved Allocators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full flex justify-between">
            <p className="font-semibold textxl">{stats?.numberOfAllocators}</p>
            <StatsLink href="/allocators">Allocators</StatsLink>
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
            <StatsLink href="/allocators">Allocators</StatsLink>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Number of Clients Served</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full flex justify-between">
            <p className="font-semibold textxl">{stats?.numberOfClients}</p>
            <StatsLink href="/clients">Clients</StatsLink>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Number of Alerts (Last 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full flex justify-between">
            <p className="font-semibold textxl">{alertsCount}</p>
            <StatsLink href="/alerts">Alerts</StatsLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Stats = memo(Component);

export { Stats };
