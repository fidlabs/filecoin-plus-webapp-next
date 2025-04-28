import { Card } from "@/components/ui/card";
import { type PropsWithChildren } from "react";

export default function StorageProvidersListLayout({
  children,
}: PropsWithChildren) {
  return (
    <main className="main-content">
      <Card className="mt-[50px]">{children}</Card>
    </main>
  );
}
