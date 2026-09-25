import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import { AppDataProvider } from "@/providers/AppDataProvider";
import "./globals.css";

const hostGrotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Nerd Logistics — Shipment Tracking",
  description: "Track a shipment or manage shipments as staff.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${hostGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppDataProvider>{children}</AppDataProvider>
      </body>
    </html>
  );
}
