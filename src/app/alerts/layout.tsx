import { JsonLd } from "@/components/json.ld";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader, PageSubTitle, PageTitle } from "@/components/ui/title";
import {
  fetchAllocatorsDailyReportChecks,
  fetchAllocatorsReportChecksWeeks,
} from "@/lib/api";
import type { PropsWithChildren, ReactNode } from "react";
import type { WebPage, WithContext } from "schema-dts";

export const revalidate = 600;

interface LayoutData {
  lastWeekAlertsCount: number;
  lastDayAlertsCount: number;
  lastDayFailingAllocatorsCount: number;
}

interface Stat {
  heading: ReactNode;
  subtext: ReactNode;
  content: ReactNode;
}

const jsonLdData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Fil+ DataCap Stats - Alerts",
  image: "https://cryptologos.cc/logos/filecoin-fil-logo.png?v=040",
  description: "Alerts regarding the state of Filecoin Plus program.",
};

async function loadLayoutData(): Promise<LayoutData> {
  const [weeksResponse, checksResponse] = await Promise.all([
    fetchAllocatorsReportChecksWeeks(),
    fetchAllocatorsDailyReportChecks(),
  ]);

  const lastDayAlertsCount = checksResponse.results.reduce((total, result) => {
    return total + result.checksFailedCount;
  }, 0);

  const lastDayFailingAllocatorsCount = checksResponse.results.filter(
    (result) => result.checksFailedCount > 0
  ).length;

  return {
    lastWeekAlertsCount: weeksResponse[0].checksFailedCount,
    lastDayAlertsCount,
    lastDayFailingAllocatorsCount,
  };
}

export default async function AlertsLayout({ children }: PropsWithChildren) {
  const {
    lastWeekAlertsCount,
    lastDayAlertsCount,
    lastDayFailingAllocatorsCount,
  } = await loadLayoutData();

  const stats: Stat[] = [
    {
      heading: "Alerts Count",
      subtext: "Last Week",
      content: lastWeekAlertsCount,
    },
    {
      heading: "Alerts Count",
      subtext: "Last 24 hours",
      content: lastDayAlertsCount,
    },
    {
      heading: "Allocators With Alerts",
      subtext: "Last 24 hours",
      content: lastDayFailingAllocatorsCount,
    },
  ];

  return (
    <JsonLd data={jsonLdData}>
      <main className="main-content flex flex-col gap-8">
        <PageHeader>
          <PageTitle>Alerts</PageTitle>
          <PageSubTitle>
            Alerts regarding the state of Filecoin Plus program.
          </PageSubTitle>
        </PageHeader>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-evenly">
          {stats.map(({ heading, subtext, content }, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{heading}</CardTitle>
                <CardDescription>{subtext}</CardDescription>
              </CardHeader>
              <CardContent>{content}</CardContent>
            </Card>
          ))}
        </div>

        {children}
      </main>
    </JsonLd>
  );
}
