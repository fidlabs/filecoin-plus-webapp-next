import { Container } from "@/components/container";
import { PageHeader, PageSubtitle, PageTitle } from "@/components/page-header";
import { type PropsWithChildren } from "react";

type LayoutProps = PropsWithChildren<{
  params: { week: string };
}>;

export default function CompliantAllocatorsLayout({ children }: LayoutProps) {
  return (
    <>
      <PageHeader className="mb-8">
        <PageTitle>Allocators by Compliance</PageTitle>
        <PageSubtitle>
          Browse allocators by their SPs compliance score
        </PageSubtitle>
      </PageHeader>
      <Container>{children}</Container>
    </>
  );
}
