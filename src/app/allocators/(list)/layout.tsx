import { Container } from "@/components/container";
import { Card } from "@/components/ui/card";
import { type PropsWithChildren } from "react";

export default function AllocatorsListLayout({ children }: PropsWithChildren) {
  return (
    <Container>
      <Card className="mt-[50px]">{children}</Card>
    </Container>
  );
}
