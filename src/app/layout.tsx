import {Montserrat} from 'next/font/google'
import "./globals.css";
import {ReactNode} from "react";
import {Header} from "@/components/header";
import {Toaster} from "@/components/ui/sonner";
import {ViewTransitions} from "next-view-transitions";
import {generatePageMetadata} from "@/lib/utils";

const font = Montserrat({
  subsets: ['latin'],
})

export const metadata = generatePageMetadata({
  title: "Fil+ DataCap Stats",
  description: "Your entry place into statistics and metrics about the Filecoin Plus program.",
  url: "https://datacapstats.io"
});

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en">
      <body
        className={`${font.className} antialiased`}
      >
      <div vaul-drawer-wrapper="">
        <Header/>
        <div className="pb-28 md:pb-10">
          {children}
        </div>
        <Toaster position="top-right"/>
      </div>
      </body>
      </html>
    </ViewTransitions>
  );
}

