"use client";
import { Suspense } from "react";
import config from "@/config";
import { useEffect } from "react";
import Header from "@/components/Header";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import WithWithout from "@/components/WithWithout";
import Hero from "@/components/Hero";
import CTA from "@/components/CTA";

export default function Page () {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/js/embed.js";
    script.async = true;
    script.defer = true;
    script.dataset.websiteId = "67d869fe01e3c264ffb82815";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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