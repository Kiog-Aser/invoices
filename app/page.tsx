"use client";
import { Suspense } from "react";
import config from "@/config";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import WithWithout from "@/components/WithWithout";
import Hero from "@/components/Hero";
import CTA from "@/components/CTA";

// Global flag to prevent duplicate script loading
declare global {
  interface Window {
    notifastScriptLoaded?: boolean;
  }
}

export default function Page () {
  const pathname = usePathname();

  useEffect(() => {
    // Only run this script on the home page (landing page)
    if (pathname === "/") {
      // Check if script is already loaded globally
      if (window.notifastScriptLoaded) {
        console.log("Script already loaded globally, skipping");
        return;
      }

      const scriptSrc = "https://www.notifast.fun/js/embed.js";
      
      // Double check DOM for existing script
      const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
      if (existingScript) {
        console.log("Script already exists in DOM, skipping");
        window.notifastScriptLoaded = true;
        return;
      }

      console.log("Loading script on homepage...");
      
      // Mark as loading to prevent race conditions
      window.notifastScriptLoaded = true;
      
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.defer = true;
      script.dataset.websiteId = "685bc24db79e1eba8622e03c";
      
      script.onload = () => {
        console.log("Notifast script loaded successfully");
      };

      script.onerror = () => {
        console.error("Notifast script failed to load");
        // Reset flag if loading failed
        window.notifastScriptLoaded = false;
      };

      document.head.appendChild(script);

      // Cleanup function
      return () => {
        console.log("Cleaning up script...");
        // Only remove if we're navigating away from homepage
        if (pathname !== "/" && document.head.contains(script)) {
          document.head.removeChild(script);
          window.notifastScriptLoaded = false;
        }
      };
    }
  }, [pathname]);

  return (
    <>
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="loading loading-spinner"></div>
        </div>
      }>
        <Header />
        
        <main className="overflow-x-hidden">
          <Hero />
          
          <WithWithout />
          <FeaturesAccordion />
          
          <FAQ />
          
          <CTA />
          
          <Footer />
        </main>
      </Suspense>
    </>
  );
}