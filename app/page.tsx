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
    <section id="pricing" className="py-24 bg-gradient-to-b from-base-300 to-base-200 relative overflow-hidden">
      {/* Background subtle grid pattern */}
      <div className="absolute inset-0 opacity-5"></div>
      
      <div className="relative max-w-5xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-medium rounded-full text-sm mb-4">
            Pricing Plans
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Professional Writing Protocols</h2>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Choose the plan that fits your content creation needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Single Protocol Plan */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-base-200">
            <div className="card-body p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Single Protocol</h3>
                <div className="text-4xl font-bold mb-2 flex items-end">
                  $39 <span className="text-base text-base-content/60 ml-1">one-time</span>
                </div>
                <p className="text-base-content/70">Perfect for initial content strategy</p>
              </div>
              
              <div className="mb-8 flex-grow">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="mt-1 rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                      <FaCheck className="w-3 h-3" />
                    </div>
                    <span><strong>Complete writing protocol</strong></span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                      <FaCheck className="w-3 h-3" />
                    </div>
                    <span><strong>30-minute strategy call</strong></span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                      <FaCheck className="w-3 h-3" />
                    </div>
                    <span>PDF export functionality</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                      <FaCheck className="w-3 h-3" />
                    </div>
                    <span>Calendar integration</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                      <FaCheck className="w-3 h-3" />
                    </div>
                    <span>AI-generated content templates</span>
                  </li>
                </ul>
              </div>
              
              <ButtonCheckout
                priceId="price_1RAEzBQF2yOHJOkbGoyJKFUh"
                mode="payment"
                successUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?success=true"}
                cancelUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?canceled=true"}
                className="btn btn-outline btn-block border-2 hover:border-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                Get Single Protocol
              </ButtonCheckout>
            </div>
          </div>
          
          {/* Unlimited Protocol Plan */}
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 relative border border-primary/30">
            <div className="absolute -top-5 -right-5 bg-primary text-white px-6 py-2 rounded-lg font-medium transform rotate-12 shadow-md">
              BEST VALUE
            </div>
            
            <div className="card-body p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Unlimited Access</h3>
                <div className="text-4xl font-bold mb-2 flex items-end text-primary">
                  $159 <span className="text-base text-base-content/60 ml-1">lifetime</span>
                </div>
                <p className="text-base-content/70">For ongoing content strategy optimization</p>
              </div>
              
              <div className="mb-8 flex-grow">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="mt-1 rounded-full p-1 bg-primary/20 text-primary mr-3 flex-shrink-0">
                      <FaCheck className="w-3 h-3" />
                    </div>
                    <span><strong>Unlimited protocol generations</strong></span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 rounded-full p-1 bg-primary/20 text-primary mr-3 flex-shrink-0">
                      <FaCheck className="w-3 h-3" />
                    </div>
                    <span><strong>Priority support</strong></span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 rounded-full p-1 bg-primary/20 text-primary mr-3 flex-shrink-0">
                      <FaCheck className="w-3 h-3" />
                    </div>
                    <span><strong>60-minute onboarding call</strong></span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 rounded-full p-1 bg-primary/20 text-primary mr-3 flex-shrink-0">
                      <FaCheck className="w-3 h-3" />
                    </div>
                    <span>All export options</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 rounded-full p-1 bg-primary/20 text-primary mr-3 flex-shrink-0">
                      <FaCheck className="w-3 h-3" />
                    </div>
                    <span>Future feature updates</span>
                  </li>
                </ul>
              </div>
              
              <ButtonCheckout
                priceId="price_1RAF0yQF2yOHJOkbGp7h8r08"
                mode="payment"
                successUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?success=true"}
                cancelUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?canceled=true"}
                className="btn btn-primary btn-block shadow-md hover:shadow-lg transition-shadow"
              >
                Get Unlimited Access
              </ButtonCheckout>
            </div>
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
        
        <main className="overflow-hidden">
          {/* Hero Section with Retro Vibe */}
          <Hero />
          
          <Problem />
          <FeaturesAccordion />
          <WithWithout />
          
          <Suspense fallback={<div className="py-20 flex justify-center"><div className="loading loading-spinner"></div></div>}>
            <PricingSection />
          </Suspense>
          
          <FAQ />
          
          <section className="py-24 bg-gradient-to-br from-base-300 to-base-200 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-base-100 to-transparent opacity-30"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl"></div>
            
            <div className="relative max-w-4xl mx-auto px-8 text-center">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-medium rounded-full text-sm mb-4">
                Start Today
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Transform Your Content Strategy</h2>
              <p className="text-xl text-base-content/70 max-w-2xl mx-auto mb-10">
                Join thousands of content creators who are using AI-powered writing protocols to 
                create more engaging content with less effort.
              </p>
              <Link 
                href="/dashboard" 
                className="btn btn-primary btn-lg px-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
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