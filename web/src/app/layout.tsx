import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Site Auditor — AI-Powered UX Audit in 60 Seconds",
  description:
    "Enter any URL. Get a scored UX audit with screenshots, persona verdicts, and actionable fixes. 4 user personas, 8 UX pillars, Lighthouse data. Free.",
  openGraph: {
    title: "Site Auditor — AI-Powered UX Audit in 60 Seconds",
    description: "Enter any URL. Get a scored UX audit with persona verdicts and actionable fixes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
