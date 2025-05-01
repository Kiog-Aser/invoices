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
    name: "Starter",
    price: 0,
    description: "Perfect for exploring the boilerplate.",
    features: [
      "All core features",
      "Community support",
      "MIT license",
    ],
    cta: "Start Free",
    priceId: "mock-starter",
  },
  {
    name: "Pro",
    price: 99,
    description: "For serious SaaS builders who want everything ready.",
    features: [
      "Everything in Starter",
      "Stripe payments integration",
      "Production-ready auth",
      "Admin dashboard",
      "Priority support",
    ],
    cta: "Buy Pro",
    priceId: "mock-pro",
    isFeatured: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-base-100">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center font-mono">Pricing</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`card bg-base-200 border border-base-content/10 rounded-xl p-8 flex flex-col items-center text-center ${plan.isFeatured ? 'shadow-lg border-primary' : 'shadow'}`}
            >
              <div className="mb-4">
                <span className="text-lg font-bold font-mono">{plan.name}</span>
              </div>
              <div className="mb-2 text-4xl font-extrabold font-mono">
                {plan.price === 0 ? 'Free' : `$${plan.price}`}
              </div>
              <div className="mb-4 text-base-content/70 font-mono">{plan.description}</div>
              <ul className="mb-6 space-y-2 text-left">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 font-mono">
                    <span className="inline-block w-2 h-2 rounded-full bg-success"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary btn-block font-mono" disabled>
                {plan.cta}
              </button>
            </div>
          ))}
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