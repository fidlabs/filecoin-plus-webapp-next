import { BackToTop } from "@/components/back-to-top";
import { Container } from "@/components/container";
import { PageHeader, PageTitle } from "@/components/page-header";
import {
  IdBasedStickyTabNaviation,
  type IdBasedStickyTabNaviationProps,
} from "@/components/sticky-tab-navigation";
import { Button } from "@/components/ui/button";
import { PoRepPageSectionId, QueryKey } from "@/lib/constants";
import Link from "next/link";
import { PoRepStatisticsWidget } from "./components/po-rep-statistics-widget";
import { PoRepParticipantsWidget } from "./components/po-rep-participants-widget";
import {
  fetchPoRepDashboardStatistics,
  FetchPoRepDashboardStatisticsParameters,
  fetchPoRepDealsValueHistory,
  FetchPoRepDealsValueHistoryParameters,
  fetchPoRepOnboardedDataHistory,
  FetchPoRepOnboardedDataHistoryParameters,
  fetchPoRepPaymentsHistory,
  FetchPoRepPaymentsHistoryParameters,
  fetchPoRepProviders,
  FetchPoRepProvidersParameters,
} from "./po-rep-data";
import { SWRConfig, unstable_serialize } from "swr";
// import { SLAPerformanceWidget } from "./components/sla-performance-widget";
// import { PoRepLeaderboardsWidget } from "./components/po-rep-leaderboards-widget";
// import { RPASLIWidget } from "./components/rpa-sli-widget";
// import { BandwidthSLIWidget } from "./components/bandwidth-sli-widget";
// import { TTFBSLIWidget } from "./components/ttfb-sli-widget";
// import { AveragePriceWidget } from "./components/average-price-widget";
// import { PoRepDCAllocatedWidget } from "./components/po-rep-dc-allocated-widget";
import { PoRepMoneyFlowWidget } from "./components/po-rep-money-flow-widget";
import { PoRepOnboardedDataHistoryWidget } from "./components/po-rep-onboarded-data-history-widget";
import { PoRepDealsValueHistoryWidget } from "./components/po-rep-deals-value-history-widget";

const sectionTabs = {
  [PoRepPageSectionId.STATS]: "Statistics",
  [PoRepPageSectionId.PARTICIPATING_STORAGE_PROVIDERS]: "Participating SPs",
  // [PoRepPageSectionId.SLA_PERFORMANCE_SCORE]: "SLA Performance",
  // [PoRepPageSectionId.SLA_RANKING]: "SLA Ranking",
  // [PoRepPageSectionId.RPA]: "RPA",
  // [PoRepPageSectionId.BANDWIDTH]: "Bandwidth",
  // [PoRepPageSectionId.TTFB]: "TTFB",
  // [PoRepPageSectionId.AVERAGE_PRICE]: "Average Price",
  // [PoRepPageSectionId.DC_ALLOCATED]: "DC Allocated",
  [PoRepPageSectionId.ONBOARDED_DATA]: "Onboarded Data",
  [PoRepPageSectionId.MONEY_FLOW]: "Money Flow",
} as const satisfies IdBasedStickyTabNaviationProps["tabs"];

const statisticsDefaultParameters: FetchPoRepDashboardStatisticsParameters = {
  interval: "day",
};

const providersDefaultParameters: FetchPoRepProvidersParameters = {
  page: 1,
  limit: 5,
};

const onboardedDataHistoryDefaultParameters: FetchPoRepOnboardedDataHistoryParameters =
  {
    windowSize: "day",
  };

const dealsValueHistoryDefaultParameters: FetchPoRepDealsValueHistoryParameters =
  {
    windowSize: "day",
  };

const paymentsHistoryDefaultParameters: FetchPoRepPaymentsHistoryParameters = {
  windowSize: "day",
};

function unwrapResult<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === "fulfilled" ? result.value : undefined;
}

export default async function PoRepPage() {
  const [
    statisticsResult,
    providersResult,
    onboardedDataHistoryResult,
    dealsValueHistoryResult,
    paymentsHistoryResult,
  ] = await Promise.allSettled([
    fetchPoRepDashboardStatistics(statisticsDefaultParameters),
    fetchPoRepProviders(providersDefaultParameters),
    fetchPoRepOnboardedDataHistory(onboardedDataHistoryDefaultParameters),
    fetchPoRepDealsValueHistory(dealsValueHistoryDefaultParameters),
    fetchPoRepPaymentsHistory(paymentsHistoryDefaultParameters),
  ]);

  const fallback = {
    [unstable_serialize([
      QueryKey.PO_REP_STATISTICS,
      statisticsDefaultParameters,
    ])]: unwrapResult(statisticsResult),
    [unstable_serialize([
      QueryKey.PO_REP_PROVIDERS,
      providersDefaultParameters,
    ])]: unwrapResult(providersResult),
    [unstable_serialize([
      QueryKey.PO_REP_ONBOARDED_DATA_HISTORY,
      onboardedDataHistoryDefaultParameters,
    ])]: unwrapResult(onboardedDataHistoryResult),
    [unstable_serialize([
      QueryKey.PO_REP_DEALS_VALUE_HISTORY,
      dealsValueHistoryDefaultParameters,
    ])]: unwrapResult(dealsValueHistoryResult),
    [unstable_serialize([
      QueryKey.PO_REP_PAYMENTS_HISTORY,
      paymentsHistoryDefaultParameters,
    ])]: unwrapResult(paymentsHistoryResult),
  };

  return (
    <SWRConfig value={{ fallback }}>
      <>
        <PageHeader>
          <PageTitle className="mb-4">PoRep Market</PageTitle>
          <Button
            variant="outline"
            asChild
            className="bg-transparent rounded-full text-white hover:text-dodger-blue"
          >
            <Link
              href="https://filecoin-provider-onboard.replit.app/"
              target="_blank"
            >
              Register Now
            </Link>
          </Button>
        </PageHeader>
        <IdBasedStickyTabNaviation className="mb-8" tabs={sectionTabs} />
        <Container className="flex flex-col gap-y-8">
          <PoRepStatisticsWidget id={PoRepPageSectionId.STATS} />
          <PoRepParticipantsWidget
            id={PoRepPageSectionId.PARTICIPATING_STORAGE_PROVIDERS}
          />
          {/* <SLAPerformanceWidget id={PoRepPageSectionId.SLA_PERFORMANCE_SCORE} /> */}
          {/* <PoRepLeaderboardsWidget id={PoRepPageSectionId.SLA_RANKING} /> */}
          {/* <RPASLIWidget id={PoRepPageSectionId.RPA} /> */}
          {/* <BandwidthSLIWidget id={PoRepPageSectionId.BANDWIDTH} /> */}
          {/* <TTFBSLIWidget id={PoRepPageSectionId.TTFB} /> */}
          {/* <AveragePriceWidget id={PoRepPageSectionId.AVERAGE_PRICE} /> */}
          {/* <PoRepDCAllocatedWidget id={PoRepPageSectionId.DC_ALLOCATED} /> */}
          <PoRepOnboardedDataHistoryWidget
            id={PoRepPageSectionId.ONBOARDED_DATA}
          />
          <PoRepDealsValueHistoryWidget id={PoRepPageSectionId.DEALS_VALUE} />
          <PoRepMoneyFlowWidget id={PoRepPageSectionId.MONEY_FLOW} />
          <BackToTop />
        </Container>
      </>
    </SWRConfig>
  );
}
