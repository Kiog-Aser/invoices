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
import CTA from "@/components/CTA";

const PRICING_PLANS = [
  {
    name: "Free",
    price: 0,
    description: "Try it out with limited projects.",
    features: [
      "1 project",
      "100 invoice searches/month",
      "Basic support",
    ],
    cta: "Start Free",
    priceId: "free",
  },
  {
    name: "Pro",
    price: 29,
    description: "Perfect for businesses of all sizes.",
    features: [
      "Unlimited projects",
      "Unlimited invoice searches",
      "Custom branding",
      "Priority email support",
      "Advanced analytics",
    ],
    cta: "Get Pro",
    priceId: "price_1234567890", // Replace with actual Stripe price ID
    isFeatured: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Choose the plan that fits your business needs
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl p-8 flex flex-col ${
                plan.isFeatured 
                  ? 'shadow-2xl border-2 border-green-500 relative' 
                  : 'shadow-lg border border-gray-200'
              }`}
            >
              {plan.isFeatured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-extrabold text-gray-800">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="text-gray-600">/month</span>}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              
              <ul className="mb-8 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {plan.price === 0 ? (
                <ButtonSignin className="btn btn-outline btn-block" />
              ) : (
                <ButtonCheckout
                  priceId={plan.priceId}
                  mode="subscription"
                  className="btn btn-success btn-block"
                >
                  {plan.cta}
                </ButtonCheckout>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600">
            All plans include a 30-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </section>
  );
}

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
          {/* Hero Section with Retro Vibe */}
          <Hero />
          
          <Problem />
          <FeaturesAccordion />
          <WithWithout />
          
          <Suspense fallback={<div className="py-20 flex justify-center"><div className="loading loading-spinner"></div></div>}>
            <PricingSection />
          </Suspense>
          
          <FAQ />
          
          {/* Replace old CTA section with the CTA component */}
          <CTA />
          
          <Footer />
        </main>
      </Suspense>
    </>
  );
}