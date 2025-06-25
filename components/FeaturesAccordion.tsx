"use client";

import { useState } from "react";
import Image from "next/image";

export default function FeaturesAccordion() {
  const [openStep, setOpenStep] = useState(1);

  const steps = [
    {
      number: "1.",
      title: "Connect Stripe accounts",
      description: "Add one or multiple Stripe accounts to InvoiceLink. It takes less than a minute. No coding required.",
      content: (
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Stripe Account</h3>
            <p className="text-gray-600 text-sm">Secure connection with restricted API keys</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-dashed border-blue-300 p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
              </svg>
            </div>
            <p className="font-semibold text-gray-900 mb-1">Connect Stripe</p>
            <p className="text-gray-500 text-sm">Click to authenticate with your Stripe account</p>
          </div>
        </div>
      )
    },
    {
      number: "2.",
      title: "Get your InvoiceLink portal",
      description: "Receive your custom branded portal link that you can share with customers for instant invoice access.",
      content: (
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Your InvoiceLink Portal</h3>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">Live</span>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 mb-3">
              <code className="text-sm text-gray-700">https://invoice.yourdomain.com/portal</code>
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition-colors">
                Copy Link
              </button>
              <button className="border border-gray-300 text-gray-700 text-sm px-3 py-1 rounded hover:bg-gray-50 transition-colors">
                Customize
              </button>
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Share this link with customers via email or your dashboard</p>
          </div>
        </div>
      )
    },
    {
      number: "3.",
      title: "Customers generate invoices",
      description: "Your customers can now search, edit, and download all their invoices without contacting support.",
      content: (
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                J
              </div>
              <div>
                <p className="font-semibold text-gray-900">John's Invoice Portal</p>
                <p className="text-gray-500 text-sm">Customer view</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Invoice #1234</p>
                  <p className="text-gray-500 text-sm">Dec 15, 2024 • $299.00</p>
                </div>
                <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                  Download PDF
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Invoice #1235</p>
                  <p className="text-gray-500 text-sm">Jan 15, 2025 • $299.00</p>
                </div>
                <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors">
                  Edit & Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Self-serve invoices for your customers
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenStep(openStep === index ? -1 : index)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-green-600 font-semibold text-lg">{step.number}</span>
                    <span className="font-semibold text-gray-900">{step.title}</span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${openStep === index ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openStep === index && (
                  <div className="px-6 pb-4 border-t border-gray-100">
                    <p className="text-gray-600 mt-4">{step.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right side - Dynamic Content */}
          <div className="min-h-[400px]">
            {steps[openStep] && steps[openStep].content}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="mt-16 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <blockquote className="text-gray-600 max-w-2xl mx-auto">
            "I added the ZenVoice link in the welcome email. So if anyone wants to have the invoice then it's self-serve. I deploy it once and I don't need to care anymore."
          </blockquote>
        </div>
      </div>
    </section>
  );
}
