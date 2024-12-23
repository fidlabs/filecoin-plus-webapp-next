import {Metadata} from "next";
import {PageTitle} from "@/components/ui/title";
import {ReactNode} from "react";
import {CdpProvider} from "@/lib/providers/cdp.provider";
import {Navigation} from "@/app/compliance-data-portal/components/navigation";

export const metadata: Metadata = {
  title: "Fil+ Dashboard | Compliance Overview",
  description: "Fil+ Dashboard | Compliance Overview",
}

const ComplianceLayout = ({
                            children,
                          }: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <main className="main-content flex flex-col justify-start gap-8 row-start-2 items-start">
      <CdpProvider>
        <PageTitle>Compliance overview</PageTitle>
        <div className="mt-9 flex gap-5 w-full">
          <Navigation/>
          <div className="flex-1">
            {children}
          </div>
        </div>
      </CdpProvider>
    </main>
  );
};

export default ComplianceLayout;