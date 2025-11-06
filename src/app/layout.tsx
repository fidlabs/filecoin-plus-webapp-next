import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { generatePageMetadata } from "@/lib/utils";
import PlausibleProvider from "next-plausible";
import { ViewTransitions } from "next-view-transitions";
import { Montserrat } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const font = Montserrat({
  subsets: ["latin"],
});

export const metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats",
  description:
    "Your entry place into statistics and metrics about the Filecoin Plus program.",
  url: "https://datacapstats.io",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body className={`${font.className} antialiased`}>
          <PlausibleProvider domain="datacapstats.io" trackOutboundLinks>
            <div vaul-drawer-wrapper="">
              <Header />
              <div className="pb-28 md:pb-10">
                {children}
                <div>
                  <div className="flex justify-center pt-6 md:pt-0 md:fixed md:top-16 md:right-[19px] z-50">
                    <Button
                      asChild
                      className="origin-right md:shadow-md md:-rotate-90  md:rounded-b-none"
                    >
                      <Link
                        href="https://form-interface-d85407.zapier.app/page"
                        target="_blank"
                        rel="noreferre noopener"
                      >
                        Propose a Dashboard
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
              <Toaster position="top-right" />
            </div>
          </PlausibleProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
