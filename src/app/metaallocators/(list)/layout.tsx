import { Card } from "@/components/ui/card";
import { type PropsWithChildren } from "react";

export default function MetaallocatorsListLayout({
  children,
}: PropsWithChildren) {
  return (
    <main className="main-content">
      <Card className="mt-[50px]">
        <div className="px-4 pt-6">
          <h2 className="text-lg font-medium">Metaallocators List</h2>
          <p className="text-sm text-muted-foreground">
            Select a Metaallocator to see list of Allocators that received
            DataCap from it.
          </p>
        </div>

        {children}
      </Card>
    </main>
  );
}
