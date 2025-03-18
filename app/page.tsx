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
import Testimonial from "@/components/Testimonials1";
import Testimonials3 from "@/components/Testimonials3";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import WithWithout from "@/components/WithWithout";
import Problem from "@/components/Problem";
import ButtonPopover from "@/components/ButtonPopover";
import Modal from "@/components/Modal";
import TestimonialRating from "@/components/TestimonialRating";
import Testimonials1 from "@/components/Testimonials1";
import Testimonial1Small from "@/components/Testimonial1Small";

function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="max-w-5xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Pay Once, Use Forever</h2>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Start with our free plan or upgrade anytime to unlock unlimited websites for life
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Free Forever</h3>
                <div className="text-4xl font-bold mb-2">$0</div>
                <p className="text-base-content/70">Perfect for trying NotiFast</p>
              </div>
              
              <div className="mb-8 flex-grow">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheck className="text-success mt-1 mr-3 flex-shrink-0" />
                    <span>1 website</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-success mt-1 mr-3 flex-shrink-0" />
                    <span>Up to 5 notifications</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-success mt-1 mr-3 flex-shrink-0" />
                    <span>Basic customization options</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-success mt-1 mr-3 flex-shrink-0" />
                    <span>One theme (iOS)</span>
                  </li>
                </ul>
              </div>
              
              <Link href="/dashboard" className="btn btn-outline btn-block">
                Start Free
              </Link>
            </div>
          </div>
          
          {/* Pro Plan */}
          <div className="card bg-primary/5 shadow-lg relative overflow-hidden border border-primary/20">
            <div className="absolute top-0 right-0 bg-primary text-primary-content px-4 py-1 font-medium">
              50% OFF
            </div>
            
            <div className="card-body">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Pro Lifetime</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-base-content/50 line-through">$20</span>
                  <span className="text-4xl font-bold">$10</span>
                </div>
                <p className="text-base-content/70">One-time payment, lifetime updates</p>
              </div>
              
              <div className="mb-8 flex-grow">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheck className="text-success mt-1 mr-3 flex-shrink-0" />
                    <span><strong>Unlimited websites</strong></span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-success mt-1 mr-3 flex-shrink-0" />
                    <span><strong>Unlimited notifications</strong></span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-success mt-1 mr-3 flex-shrink-0" />
                    <span>Advanced customization options</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-success mt-1 mr-3 flex-shrink-0" />
                    <span>Custom notification themes</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-success mt-1 mr-3 flex-shrink-0" />
                    <span>No NotiFast backlinks</span>
                  </li>
                </ul>
              </div>
              
              <ButtonCheckout
                priceId="price_1R0h7qE9pBPkT56e79CYuP3r"
                mode="payment"
                successUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?success=true"}
                cancelUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?canceled=true"}
                className="btn btn-primary btn-block"
              >
                Get Pro Access
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
          {/* Hero Section */}
          <section className="relative py-12 sm:py-20 bg-gradient-to-b from-base-200 to-base-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center">
                <div className="lg:w-1/2 mb-8 lg:mb-0 text-center lg:text-left">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                    Stop losing visitors to <span className="text-primary">poor engagement</span>
                  </h1>
                  <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-base-content/80 max-w-xl mx-auto lg:mx-0">
                    Add one line of code and start converting more visitors today.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link href="/dashboard" className="btn btn-primary btn-lg w-full sm:w-auto">
                      Try Free Forever
                    </Link>
                    <a href="#pricing" className="btn btn-outline btn-lg w-full sm:w-auto">
                      View Pricing
                    </a>
                  </div>
                  
                  <div className="mt-6 sm:mt-8 flex items-center justify-center lg:justify-start text-sm text-base-content/60">
                    <FaCheckCircle className="text-success mr-2" />
                    No credit card required
                  </div>
                </div>
                <div className="lg:w-1/2 w-full px-4 sm:px-0">

                  <video
              className="rounded-2xl w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/notifast-demo.webm"
              onError={(e) => {
                console.error('Error loading video:', e);
              }}
            >
              <source src="/notifast-demo.webm" type="video/webm" />
            </video>

                </div>
              </div>
            </div>
          </section>
          <Problem />
          <FeaturesAccordion />
          
          <Suspense fallback={<div className="py-20 flex justify-center"><div className="loading loading-spinner"></div></div>}>
            <PricingSection />
          </Suspense>
          <Testimonial1Small />
          <FAQ />
          <section className="py-24 bg-base-300">
            <div className="max-w-4xl mx-auto px-8 text-center">
              <h2 className="text-3xl font-bold mb-8">Ready to boost engagement?</h2>
              <p className="text-xl text-base-content/70 max-w-2xl mx-auto mb-12">
                Start creating beautiful iOS-style notifications for your website today.
                No credit card required for free plan.
              </p>
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                Get Started Now
              </Link>
            </div>
          </section>
          
          <Footer />
        </main>
      </Suspense>
    </>
  );
}