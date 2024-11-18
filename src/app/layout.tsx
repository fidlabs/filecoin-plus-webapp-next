import type {Metadata} from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import {ReactNode} from "react";
import {Header} from "@/components/header";
import {Toaster} from "@/components/ui/sonner";

const font = Inter({
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
    <html lang="en">
    <body
      className={`${font.className} antialiased`}
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

