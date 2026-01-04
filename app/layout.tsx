import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppFlowProvider } from "@/context/AppFlowContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CredGuard AI",
  description: "Smart decisions for your financial future.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-slate-50 min-h-screen text-slate-900`}
      >
        <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10 bg-fixed" />
        <AppFlowProvider>
          <main className="min-h-screen flex flex-col items-center justify-center p-4">
            {children}
          </main>
        </AppFlowProvider>
      </body>
    </html>
  );
}
