import { Container } from "@/components/container";
import { HeaderExtensionOverlay } from "@/components/header-extension-overlay";
import { PageHeader, PageSubtitle, PageTitle } from "@/components/page-header";
import { type PropsWithChildren } from "react";

type LayoutProps = PropsWithChildren<{
  params: { week: string };
}>;

export default function CompliantAllocatorsLayout({ children }: LayoutProps) {
  return (
    <>
      <PageHeader>
        <PageTitle>Allocators by Compliance</PageTitle>
        <PageSubtitle>
          Browse allocators by their SPs compliance score
        </PageSubtitle>
      </PageHeader>
      <HeaderExtensionOverlay>
        <Container>{children}</Container>
      </HeaderExtensionOverlay>
    </>
  );
}
