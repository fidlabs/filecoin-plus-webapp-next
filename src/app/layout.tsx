import type {Metadata} from "next";
import {Montserrat} from 'next/font/google'
import "./globals.css";
import {ReactNode} from "react";
import {Header} from "@/components/header";
import {Toaster} from "@/components/ui/sonner";
import {ViewTransitions} from "next-view-transitions";
import {Product, WithContext} from "schema-dts";

const font = Montserrat({
  subsets: ['latin'],
})

const product: WithContext<Product> = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Fil+ DataCap Stats',
  image: 'https://cryptologos.cc/logos/filecoin-fil-logo.png?v=040',
  description: 'Your entry place into statistics and metrics about the Filecoin Plus program.',
}

export const metadata: Metadata = {
  title: "Fil+ DataCap Stats",
  description: "Your entry place into statistics and metrics about the Filecoin Plus program.",
}

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
        <div className="pb-7">
          {children}
        </div>
        <Toaster position="top-right"/>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(product)}}
      />
      </body>
      </html>
    </ViewTransitions>
  );
}

