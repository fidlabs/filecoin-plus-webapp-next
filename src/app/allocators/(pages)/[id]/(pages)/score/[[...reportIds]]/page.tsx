import { AllocatorScoreBadge } from "@/components/allocator-score-badge";
import { AllocatorScoreResultChart } from "@/components/allocator-score-result-chart";
import { GenericContentHeader } from "@/components/generic-content-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type ITabNavigatorTab } from "@/components/ui/tab-navigator";
import { getAllocatorReportById } from "@/lib/api";
import { isHTTPError } from "@/lib/http-errors";
import { ICDPAllocatorFullReport } from "@/lib/interfaces/cdp/cdp.interface";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export const revalidate = 0;

interface PageProps {
  params: {
    id: string;
    reportIds?: string[];
  };
}

interface PageData {
  report: ICDPAllocatorFullReport;
  reportObsolete: boolean;
}

interface FetchPageDataParameters {
  allocatorId: string;
  reportId?: string;
}

async function fetchPageData({
  allocatorId,
  reportId,
}: FetchPageDataParameters): Promise<PageData | null> {
  const latestReport = await getAllocatorReportById(allocatorId, "latest");

  if (!reportId || latestReport.id === reportId) {
    return {
      report: latestReport,
      reportObsolete: false,
    };
  }

  try {
    const report = await getAllocatorReportById(allocatorId, reportId);

    return {
      report,
      reportObsolete: true,
    };
  } catch (error) {
    if (!isHTTPError(error) || error.status !== 404) {
      throw error;
    }

    return null;
  }
}

export default async function AllocatorScorePage({ params }: PageProps) {
  const { id: allocatorId, reportIds = [] } = params;
  const pageData = await fetchPageData({
    allocatorId,
    reportId: reportIds[0],
  });

  if (pageData === null) {
    return redirect(`/allocators/${allocatorId}/score`);
  }

  const tabs = [
    {
      label: "Verified Clients",
      href: `/allocators/${allocatorId}`,
      value: "list",
    },
    {
      label: "Allocations over time",
      href: `/allocators/${allocatorId}/over-time`,
      value: "chart",
    },
    {
      label: "Reports",
      href: `/allocators/${allocatorId}/reports`,
      value: "reports",
    },
    {
      label: "Score",
      href: `/allocators/${allocatorId}/score`,
      value: "score",
    },
  ] as ITabNavigatorTab[];

  return (
    <div className="main-content">
      <Card className="mb-6">
        <GenericContentHeader
          sticky
          navigation={tabs}
          selected="score"
          fixedHeight={false}
        />

        <CardContent
          className={cn(
            "pt-6 flex flex-col items-center space-y-4 lg:space-y-0 lg:flex-row lg:justify-center",
            pageData.reportObsolete && "lg:justify-between"
          )}
        >
          <AllocatorScoreBadge
            scoringResults={pageData.report.scoring_results}
          />

          {pageData.reportObsolete && (
            <div className="max-w-[420px]">
              <p className="text-sm text-center border border-orange-500 bg-orange-500/20 p-4 rounded-lg">
                You are viewing score for past report.{" "}
                <Button asChild variant="link">
                  <Link href={`/allocators/${allocatorId}/score`}>
                    Click here
                  </Link>
                </Button>{" "}
                to view score breakdown for latest report.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 min-[1600px]:grid-cols-3 gap-6 lg:gap-4">
        {pageData.report.scoring_results.map((result) => {
          return (
            <AllocatorScoreResultChart key={result.metric} result={result} />
          );
        })}
      </div>
    </div>
  );
}
