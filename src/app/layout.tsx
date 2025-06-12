import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/sonner";
import { generatePageMetadata } from "@/lib/utils";
import PlausibleProvider from "next-plausible";
import { ViewTransitions } from "next-view-transitions";
import { Montserrat } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";

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
              <Navigation />
              <div className="pb-28 md:pb-10 space-y-10">{children}</div>
              <Toaster position="top-right" />
            </div>
          </PlausibleProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
