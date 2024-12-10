import type {Metadata} from "next";
import {Montserrat} from 'next/font/google'
import "./globals.css";
import {ReactNode} from "react";
import {Header} from "@/components/header";
import {Toaster} from "@/components/ui/sonner";
import {ViewTransitions} from "next-view-transitions";

const font = Montserrat({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "Fil+ Dashboard",
  description: "Fil+ Dashboard",
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
      </body>
      </html>
    </ViewTransitions>
  );
}

