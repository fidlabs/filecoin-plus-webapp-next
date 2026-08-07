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
import { SWRConfig, unstable_serialize } from "swr";
import { PoRepParticipantsWidget } from "./components/po-rep-participants-widget";
import { PoRepStatisticsWidget } from "./components/po-rep-statistics-widget";
import {
  fetchPoRepActiveClientsHistory,
  FetchPoRepActiveClientsHistoryParameters,
  fetchPoRepDashboardStatistics,
  FetchPoRepDashboardStatisticsParameters,
  fetchPoRepProviders,
  FetchPoRepProvidersParameters,
} from "./po-rep-data";
// import { PoRepLeaderboardsWidget } from "./components/po-rep-leaderboards-widget";
// import { RPASLIWidget } from "./components/rpa-sli-widget";
// import { BandwidthSLIWidget } from "./components/bandwidth-sli-widget";
// import { TTFBSLIWidget } from "./components/ttfb-sli-widget";
// import { AveragePriceWidget } from "./components/average-price-widget";
// import { PoRepDCAllocatedWidget } from "./components/po-rep-dc-allocated-widget";
import {
  fetchPoRepDealsValueHistory,
  fetchPoRepOnboardedDataHistory,
  fetchPoRepSettlementsHistory,
  fetchPoRepSliComplianceHistory,
  PoRepDealsValueHistoryParameters,
  PoRepOnboardedDataHistoryParameters,
  PoRepSettlementsHistoryParameters,
  PoRepSliComplianceHistoryParameters,
} from "@/lib/cdp";
import { createPreloader } from "@/lib/data-loading";
import { PoRepActiveClientsHistoryWidget } from "./components/po-rep-active-clients-history-widget";
import { PoRepDealsValueHistoryWidget } from "./components/po-rep-deals-value-history-widget";
import { PoRepMoneyFlowWidget } from "./components/po-rep-money-flow-widget";
import { PoRepOnboardedDataHistoryWidget } from "./components/po-rep-onboarded-data-history-widget";
import { SLIComplianceHistoryWidget } from "./components/sli-compliance-history-widget";
import { GasUsageWidget } from "./components/gas-usage-widget";
import { fetchGasUsage } from "@/lib/po-rep-oracle";

export const revalidate = 1800; // 30 minutes

const sectionTabs = {
  [PoRepPageSectionId.STATS]: "Statistics",
  [PoRepPageSectionId.ONBOARDED_DATA]: "Onboarded Data",
  [PoRepPageSectionId.DEALS_VALUE]: "Predicted Revenue",
  [PoRepPageSectionId.MONEY_FLOW]: "Money Flow",
  [PoRepPageSectionId.ACTIVE_CLIENTS_HISTORY]: "Active Clients",
  [PoRepPageSectionId.SLI_PERFORMANCE]: "SLI Performance",
  [PoRepPageSectionId.PARTICIPATING_STORAGE_PROVIDERS]: "Participating SPs",
  [PoRepPageSectionId.GAS_USAGE]: "Gas Usage",
  // [PoRepPageSectionId.SLA_RANKING]: "SLA Ranking",
  // [PoRepPageSectionId.RPA]: "RPA",
  // [PoRepPageSectionId.BANDWIDTH]: "Bandwidth",
  // [PoRepPageSectionId.TTFB]: "TTFB",
  // [PoRepPageSectionId.AVERAGE_PRICE]: "Average Price",
  // [PoRepPageSectionId.DC_ALLOCATED]: "DC Allocated",
} as const satisfies IdBasedStickyTabNaviationProps["tabs"];

const statisticsDefaultParameters: FetchPoRepDashboardStatisticsParameters = {
  interval: "day",
};

const providersDefaultParameters: FetchPoRepProvidersParameters = {
  page: 1,
  limit: 5,
};

const onboardedDataHistoryDefaultParameters: PoRepOnboardedDataHistoryParameters =
  {
    windowSize: "day",
  };

const dealsValueHistoryDefaultParameters: PoRepDealsValueHistoryParameters = {
  windowSize: "day",
};

const settlementsHistoryDefaultParameters: PoRepSettlementsHistoryParameters = {
  windowSize: "day",
};

const activeClientsHistoryDefaultParameters: FetchPoRepActiveClientsHistoryParameters =
  {
    windowSize: "day",
  };

const sliHistoryDefaultParameters: PoRepSliComplianceHistoryParameters = {
  windowSize: "week",
  sliType: undefined,
  providerId: undefined,
};

function unwrapResult<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === "fulfilled" ? result.value : undefined;
}

const preloadOnboardedDataHistory = createPreloader(
  QueryKey.PO_REP_ONBOARDED_DATA_HISTORY,
  fetchPoRepOnboardedDataHistory
);
const preloadDealsValueHistory = createPreloader(
  QueryKey.PO_REP_DEALS_VALUE_HISTORY,
  fetchPoRepDealsValueHistory
);
const preloadSettlementsHistory = createPreloader(
  QueryKey.PO_REP_SETTLEMENTS_HISTORY,
  fetchPoRepSettlementsHistory
);
const preloadSliComplianceHistory = createPreloader(
  QueryKey.PO_REP_SLI_COMPLIANCE_HISTORY,
  fetchPoRepSliComplianceHistory
);
const preloadGasUsage = createPreloader(
  QueryKey.PO_REP_GAS_USAGE,
  fetchGasUsage
);

export default async function PoRepPage() {
  const [statisticsResult, providersResult, activeClientsHistoryResult] =
    await Promise.allSettled([
      fetchPoRepDashboardStatistics(statisticsDefaultParameters),
      fetchPoRepProviders(providersDefaultParameters),
      fetchPoRepActiveClientsHistory(activeClientsHistoryDefaultParameters),
    ]);

  const preloadedData = await Promise.all([
    preloadOnboardedDataHistory(onboardedDataHistoryDefaultParameters),
    preloadDealsValueHistory(dealsValueHistoryDefaultParameters),
    preloadSettlementsHistory(settlementsHistoryDefaultParameters),
    preloadSliComplianceHistory(sliHistoryDefaultParameters),
    preloadGasUsage({}),
  ]);

  const fallback = {
    ...Object.fromEntries(preloadedData),
    [unstable_serialize([
      QueryKey.PO_REP_STATISTICS,
      statisticsDefaultParameters,
    ])]: unwrapResult(statisticsResult),
    [unstable_serialize([
      QueryKey.PO_REP_PROVIDERS,
      providersDefaultParameters,
    ])]: unwrapResult(providersResult),
    [unstable_serialize([
      QueryKey.PO_REP_ACTIVE_CLIENTS_HISTORY,
      activeClientsHistoryDefaultParameters,
    ])]: unwrapResult(activeClientsHistoryResult),
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
          <PoRepActiveClientsHistoryWidget
            id={PoRepPageSectionId.ACTIVE_CLIENTS_HISTORY}
          />
          <SLIComplianceHistoryWidget id={PoRepPageSectionId.SLI_PERFORMANCE} />
          <PoRepParticipantsWidget
            id={PoRepPageSectionId.PARTICIPATING_STORAGE_PROVIDERS}
          />
          <GasUsageWidget id={PoRepPageSectionId.GAS_USAGE} />
          <BackToTop />
        </Container>
      </>
    </SWRConfig>
  );
}
