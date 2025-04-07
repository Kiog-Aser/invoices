"use client";
import { Suspense } from "react";
import config from "@/config";
import Link from "next/link";
import ButtonSignin from "@/components/ButtonSignin";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaCheck, FaCheckCircle } from "react-icons/fa";
import ButtonCheckout from "@/components/ButtonCheckout";
import Header from "@/components/Header";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import WithWithout from "@/components/WithWithout";
import Problem from "@/components/Problem";
import Testimonial1Small from "@/components/Testimonial1Small";
import Hero from "@/components/Hero";

function PricingSection() {
  return (
    <section id="pricing" className="bg-base-300 min-h-[90vh] lg:min-h-screen flex items-center relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-28">
      {/* Retro grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-[length:20px_20px] opacity-25"></div>
      
      {/* Decorative elements - using percentage-based positioning to prevent overflow */}
      <div className="absolute bottom-20 right-[10%] w-40 h-40 bg-primary/5 rounded-full blur-xl"></div>
      <div className="absolute top-40 left-[5%] w-60 h-60 bg-secondary/5 rounded-full blur-xl"></div>
      
      <div className="relative max-w-5xl mx-auto px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-base-100 rounded-xl shadow-md border border-base-content/10 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="font-mono text-sm tracking-widest">PRICING PLANS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-mono">Professional Writing Protocols</h2>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto font-mono">
            Choose the plan that fits your content creation needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Single Protocol Plan */}
          <div className="bg-base-100 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-300 border border-base-content/10 p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 font-mono">Single Protocol</h3>
              <div className="text-4xl font-bold mb-2 flex items-end font-mono">
                $39 <span className="text-base text-base-content/60 ml-1">one-time</span>
              </div>
              <p className="text-base-content/70 font-mono text-sm">Perfect for initial content strategy</p>
            </div>
            
            <div className="mb-8 flex-grow">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                    <FaCheck className="w-3 h-3" />
                  </div>
                  <span className="font-mono"><strong>Complete writing protocol</strong></span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                    <FaCheck className="w-3 h-3" />
                  </div>
                  <span className="font-mono"><strong>30-minute strategy call</strong></span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                    <FaCheck className="w-3 h-3" />
                  </div>
                  <span className="font-mono">PDF export functionality</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                    <FaCheck className="w-3 h-3" />
                  </div>
                  <span className="font-mono">Calendar integration</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                    <FaCheck className="w-3 h-3" />
                  </div>
                  <span className="font-mono">AI-generated content templates</span>
                </li>
              </ul>
            </div>
            
            <ButtonCheckout
              priceId="price_1RBLRmG19CrUMKRawDhN6cXJ"
              mode="payment"
              successUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?success=true"}
              cancelUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?canceled=true"}
              className="btn font-mono btn-outline btn-block border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
            >
              Get Single Protocol
            </ButtonCheckout>
          </div>
          
          {/* Unlimited Protocol Plan */}
          <div className="bg-base-100 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-300 relative border border-primary/30 p-8">
            <div className="absolute -top-5 -right-5 bg-primary text-white px-6 py-2 rounded-lg font-mono text-sm font-medium transform rotate-12 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
              BEST VALUE
            </div>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 font-mono">Unlimited Access</h3>
              <div className="text-4xl font-bold mb-2 flex items-end text-primary font-mono">
                $159 <span className="text-base text-base-content/60 ml-1">lifetime</span>
              </div>
              <p className="text-base-content/70 font-mono text-sm">For ongoing content strategy optimization</p>
            </div>
            
            <div className="mb-8 flex-grow">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-primary/20 text-primary mr-3 flex-shrink-0">
                    <FaCheck className="w-3 h-3" />
                  </div>
                  <span className="font-mono"><strong>Unlimited protocol generations</strong></span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-primary/20 text-primary mr-3 flex-shrink-0">
                    <FaCheck className="w-3 h-3" />
                  </div>
                  <span className="font-mono"><strong>Priority support</strong></span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-primary/20 text-primary mr-3 flex-shrink-0">
                    <FaCheck className="w-3 h-3" />
                  </div>
                  <span className="font-mono"><strong>60-minute onboarding call</strong></span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-primary/20 text-primary mr-3 flex-shrink-0">
                    <FaCheck className="w-3 h-3" />
                  </div>
                  <span className="font-mono">All export options</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-primary/20 text-primary mr-3 flex-shrink-0">
                    <FaCheck className="w-3 h-3" />
                  </div>
                  <span className="font-mono">Future feature updates</span>
                </li>
              </ul>
            </div>
            
            <ButtonCheckout
              priceId="price_1RBLRiG19CrUMKRaaun6VaCZ"
              mode="payment"
              successUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?success=true"}
              cancelUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?canceled=true"}
              className="btn btn-primary btn-block font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
            >
              Get Unlimited Access
            </ButtonCheckout>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
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
          {/* Hero Section with Retro Vibe */}
          <Hero />
          
          <Problem />
          <FeaturesAccordion />
          <WithWithout />
          
          <Suspense fallback={<div className="py-20 flex justify-center"><div className="loading loading-spinner"></div></div>}>
            <PricingSection />
          </Suspense>
          
          <FAQ />
          
          <section className="py-24 bg-base-200 relative overflow-hidden">
            {/* Retro grid background */}
            
            
            {/* Decorative elements - using percentage-based positioning to ensure they stay within bounds */}
            <div className="absolute -top-20 right-[10%] w-60 h-60 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-20 left-[10%] w-80 h-80 bg-secondary/10 rounded-full blur-xl"></div>
            
            <div className="relative max-w-4xl mx-auto px-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-base-100 rounded-xl shadow-md border border-base-content/10 mb-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="font-mono text-sm tracking-widest">START TODAY</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-mono">Transform Your Content Strategy</h2>
              <p className="text-xl text-base-content/70 max-w-2xl mx-auto mb-10 font-mono">
                Join thousands of content creators who are using AI-powered writing protocols to 
                create more engaging content with less effort.
              </p>
              <Link 
                href="/dashboard" 
                className="btn btn-primary btn-lg px-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 font-mono group"
              >
                <span>Create Your Protocol</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              
            </div>
          </section>
          
          <Footer />
        </main>
      </Suspense>
    </>
  );
}