import { PageHeader, PageSubtitle, PageTitle } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getClientReportById } from "@/lib/api";
import { isHTTPError } from "@/lib/http-errors";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportsLayout } from "./components/reports-layout";

export const revalidate = 3600;

interface PageProps {
  params: { report: string[]; id: string };
}

export default async function ClientReportDetailPage({ params }: PageProps) {
  try {
    const reports = await Promise.all(
      params.report.map(async (report) =>
        getClientReportById(params.id, report)
      )
    );

    return (
      <>
        <PageHeader>
          <PageTitle className="truncate">
            {params.report.length > 1
              ? "Reports Comparsion"
              : `Report ${params.report[0]}`}
          </PageTitle>
          <PageSubtitle className="mb-8">
            Client ID:{" "}
            <Button variant="link" asChild className="text-white">
              <Link href={`/clients/${params.id}`}>{params.id}</Link>
            </Button>
          </PageSubtitle>
        </PageHeader>
        <div className="-mt-10">
          <ReportsLayout reports={reports} />
        </div>
      </>
    );
  } catch (error) {
    if (isHTTPError(error) && error.status === 404) {
      return notFound();
    }

    throw error;
  }
}
