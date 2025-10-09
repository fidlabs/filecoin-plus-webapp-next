import { Container } from "@/components/container";
import { PageHeader, PageSubtitle, PageTitle } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { type PropsWithChildren } from "react";

export default function MetaallocatorsListLayout({
  children,
}: PropsWithChildren) {
  return (
    <>
      <PageHeader>
        <PageTitle>Metaallocators List</PageTitle>
        <PageSubtitle>
          Select a Metaallocator to see list of Allocators that received DataCap
          from it.
        </PageSubtitle>
      </PageHeader>
      <Container>
        <Card className="mt-12">{children}</Card>
      </Container>
    </>
  );
}
