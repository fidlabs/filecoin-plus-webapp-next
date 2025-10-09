import { Container } from "@/components/container";
import { Card } from "@/components/ui/card";
import { type PropsWithChildren } from "react";

export default function StorageProvidersListLayout({
  children,
}: PropsWithChildren) {
  return (
    <Container>
      <Card className="mt-12">{children}</Card>
    </Container>
  );
}
