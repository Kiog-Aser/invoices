import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Viewport } from "next";
import { Toaster } from "react-hot-toast";
import PlausibleProvider from "next-plausible";
import { getSEOTags } from "@/libs/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "./globals.css";

const font = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: config.colors.main,
  width: "device-width",
  initialScale: 1,
};

export const metadata = getSEOTags();

export default function RootLayout({ children }: { children: ReactNode }) {
  // Check if the current page is a dashboard page
  const isDashboard = typeof window !== 'undefined' ? window.location.pathname.startsWith('/dashboard') : false;

  return (
    <html lang="en" data-theme={config.colors.theme} className={font.className}>
      <head>
        {config.domainName && <PlausibleProvider domain={config.domainName} />}
      </head>
      <body className={`${font.className} min-h-screen flex flex-col`}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        <div className="flex-1 w-full">
          <div className="max-w-screen-2xl mx-auto">
            {/* For all pages except dashboard */}
            {!isDashboard && (
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 px-4 sm:px-6 lg:px-8">
                  {children}
                </main>
                <Footer />
              </div>
            )}
            
            {/* For dashboard */}
            {isDashboard && (
              <div className="min-h-screen">
                {children}
              </div>
            )}
          </div>
        </div>
        
        <ClientLayout>
          {/* This will be shown above the content */}
          <div id="modal-root" />
          <Toaster position="top-center" />
        </ClientLayout>
      </body>
    </html>
  );
}
