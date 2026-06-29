import { BackToTop } from "@/components/back-to-top";
import { Container } from "@/components/container";
import { PageHeader, PageSubtitle, PageTitle } from "@/components/page-header";
import { F0Id, isF0IdInput } from "@/lib/f0-id";
import { permanentRedirect } from "next/navigation";
import { PoRepProviderSLIPerformanceWidget } from "./components/po-rep-provider-sli-performance-widget";

export interface PageProps {
  params: { providerId: string };
}

export default function PoRepProviderPage({ params }: PageProps) {
  if (!isF0IdInput(params.providerId)) {
    return permanentRedirect("/not-found");
  }

  const f0Id = F0Id.from(params.providerId);

  return (
    <>
      <PageHeader className="mb-8">
        <PageTitle>{f0Id.toString()}</PageTitle>
        <PageSubtitle>Provider Po-Rep Details</PageSubtitle>
      </PageHeader>

      <Container className="flex flex-col gap-y-8">
        <PoRepProviderSLIPerformanceWidget providerId={f0Id.toBigInt()} />
        <BackToTop />
      </Container>
    </>
  );
}
