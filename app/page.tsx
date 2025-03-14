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
import LogoutCountdownWrapper from '@/components/LogoutCountdownWrapper';
import TestimonialRating from "@/components/TestimonialRating";

function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="max-w-5xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Start with our free plan forever or upgrade to unlock unlimited websites
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Free Forever</h3>
                <div className="text-4xl font-bold mb-2">$0</div>
                <p className="text-base-content/70">Perfect for individuals</p>
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
                Get Started Free
              </Link>
            </div>
          </div>
          
          {/* Pro Plan */}
          <div className="card bg-primary/5 shadow-lg relative overflow-hidden border border-primary/20">
            <div className="absolute top-0 right-0 bg-primary text-primary-content px-4 py-1 font-medium">
              MOST POPULAR
            </div>
            
            <div className="card-body">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Pro Lifetime</h3>
                <div className="text-4xl font-bold mb-2">$10</div>
                <p className="text-base-content/70">One-time payment, lifetime access</p>
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
                priceId="price_1R0PNQIpDPy0JgwZ33p7CznT"
                mode="payment"
                successUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?success=true"}
                cancelUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?canceled=true"}
                className="btn btn-primary btn-block"
              />
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
    script.dataset.websiteId = "67d1ee0297c36cce9ddd19c5";
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
        <LogoutCountdownWrapper />
        <Header />
        
        <main className="overflow-hidden">
          {/* Hero Section */}
          <section className="relative py-12 sm:py-20 bg-gradient-to-b from-base-200 to-base-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center">
                <div className="lg:w-1/2 mb-8 lg:mb-0 text-center lg:text-left">
                 {/* <Suspense fallback={<div className="loading loading-spinner"></div>}>
                    <TestimonialRating />
                  </Suspense> */} 
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                    Notifications that <span className="text-primary">convert visitors</span>
                  </h1>
                  <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-base-content/80 max-w-xl mx-auto lg:mx-0">
                    NotiFast helps you engage visitors with elegant notifications
                    that increase conversions and improve user engagement.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link href="/dashboard" className="btn btn-primary btn-lg w-full sm:w-auto">
                      Get Started — Free Forever
                    </Link>
                    <a href="#pricing" className="btn btn-outline btn-lg w-full sm:w-auto">
                      View Pricing
                    </a>
                  </div>
                  
                  <div className="mt-6 sm:mt-8 flex items-center justify-center lg:justify-start text-sm text-base-content/60">
                    <FaCheckCircle className="text-success mr-2" />
                    No credit card required for free plan
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
              poster="/notifast-demo.jpg"
              onError={(e) => {
                console.error('Error loading video:', e);
              }}
            >
              <source src="/notifast-demo.mp4" type="video/mp4" />
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
          
          <FAQ />
          <Testimonials3 />
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