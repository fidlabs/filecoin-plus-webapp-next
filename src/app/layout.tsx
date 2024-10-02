import type {Metadata} from "next";
import localFont from "next/font/local";
import "./globals.css";
import {ReactNode} from "react";
import {Header} from "@/components/header";
import {Toaster} from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
    <html lang="en">
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
    <div vaul-drawer-wrapper="">
      <Header/>
      <div className="w-full max-w-[1600px] mx-auto px-4 pb-14">
        {children}
      </div>
      <Toaster position="top-right"/>
    </div>
    </body>
    </html>
  );
}

