import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "VEIL — Secret Peer-to-Peer Messaging",
  description: "Private, ephemeral, peer-to-peer secret messaging application with zero cloud chat storage.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
