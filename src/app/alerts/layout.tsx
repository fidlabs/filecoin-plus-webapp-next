import { Container } from "@/components/container";
import { JsonLd } from "@/components/json.ld";
import { PageHeader, PageSubtitle, PageTitle } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  fetchAllocatorsDailyReportChecks,
  fetchAllocatorsReportChecksWeeks,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type { PropsWithChildren, ReactNode } from "react";
import type { WebPage, WithContext } from "schema-dts";

export const revalidate = 600;

interface LayoutData {
  lastWeekAlertsCount: number;
  lastWeekAlertsChange: number | null;
  lastDayAlertsCount: number;
  lastDayAlertsChange: number;
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

  const [lastDayAlertsCount, lastDayAlertsChange] =
    checksResponse.results.reduce(
      ([totalAlerts, totalChange], result) => {
        return [
          totalAlerts + result.checksFailedCount,
          totalChange + (result.checksFailedChange ?? 0),
        ];
      },
      [0, 0]
    );

  const lastDayFailingAllocatorsCount = checksResponse.results.filter(
    (result) => result.checksFailedCount > 0
  ).length;

  return {
    lastWeekAlertsCount: weeksResponse[0].checksFailedCount,
    lastWeekAlertsChange: weeksResponse[0].checksFailedChange ?? null,
    lastDayAlertsCount,
    lastDayAlertsChange,
    lastDayFailingAllocatorsCount,
  };
}

export default async function AlertsLayout({ children }: PropsWithChildren) {
  const {
    lastWeekAlertsCount,
    lastWeekAlertsChange,
    lastDayAlertsCount,
    lastDayAlertsChange,
    lastDayFailingAllocatorsCount,
  } = await loadLayoutData();

  const lastWeekAlertsChangePercentage =
    lastWeekAlertsChange !== null
      ? (lastWeekAlertsChange / lastWeekAlertsCount) * 100
      : null;
  const lastDayAlertsChangePercentage =
    (lastDayAlertsChange / lastDayAlertsCount) * 100;

  const stats: Stat[] = [
    {
      heading: "Alerts Count",
      subtext: "Last Week",
      content: (
        <p>
          {lastWeekAlertsCount}{" "}
          {lastWeekAlertsChangePercentage !== null && (
            <PercentageChangeText value={lastWeekAlertsChangePercentage} />
          )}
        </p>
      ),
    },
    {
      heading: "Alerts Count",
      subtext: "Last 24 hours",
      content: (
        <p>
          {lastDayAlertsCount}{" "}
          <PercentageChangeText value={lastDayAlertsChangePercentage} />
        </p>
      ),
    },
    {
      heading: "Allocators With Alerts",
      subtext: "Last 24 hours",
      content: lastDayFailingAllocatorsCount,
    },
  ];

  return (
    <JsonLd data={jsonLdData}>
      <main className="flex flex-col gap-8">
        <PageHeader>
          <PageTitle>Alerts</PageTitle>
          <PageSubtitle>
            Alerts regarding the state of Filecoin Plus program.
          </PageSubtitle>
        </PageHeader>

        <Container className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-evenly">
          {stats.map(({ heading, subtext, content }, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{heading}</CardTitle>
                <CardDescription>{subtext}</CardDescription>
              </CardHeader>
              <CardContent>{content}</CardContent>
            </Card>
          ))}
        </Container>

        {children}
      </main>
    </JsonLd>
  );
}

function PercentageChangeText({ value }: { value: number }) {
  return (
    <span
      className={cn("text-muted-foreground", {
        "text-red-500": value > 0,
        "text-green-500": value < 0,
      })}
    >
      ({value > 0 ? "+" : ""}
      {Math.round(value)}%)
    </span>
  );
}
