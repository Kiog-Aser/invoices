"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";

const FAQS = [
  {
    q: "Why do I need ZenVoice?",
    a: "Stripe charges 0.4% fee for every invoice you send. ZenVoice eliminates this fee by letting customers generate their own invoices through a simple link. You save money and reduce support requests.",
  },
  {
    q: "Do I have to use Stripe?",
    a: "Yes, ZenVoice works specifically with Stripe accounts. It connects to your existing Stripe account to retrieve payment data and generate invoices.",
  },
  {
    q: "Does it work for one-time purchases?",
    a: "Absolutely! ZenVoice works for all types of Stripe payments including one-time purchases, subscriptions, and payment links.",
  },
  {
    q: "Does it work for Payment Links?",
    a: "Yes! ZenVoice retrieves all successful payments from your Stripe account, including those made through Payment Links.",
  },
  {
    q: "Does it work for subscriptions?",
    a: "Yes, ZenVoice supports subscription payments. Customers can access invoices for all their subscription charges.",
  },
  {
    q: "Does it work if I don't use Stripe Invoicing?",
    a: "Yes! ZenVoice works with any successful Stripe payment, regardless of whether you use Stripe's invoicing feature or not.",
  },
  {
    q: "Does it work for past transactions?",
    a: "Yes, ZenVoice can retrieve and generate invoices for all past successful payments in your Stripe account.",
  },
  {
    q: "Is it secure?",
    a: "Absolutely. ZenVoice uses restricted Stripe API keys with read-only access. We never store sensitive payment information and follow industry security standards.",
  },
  {
    q: "Can customers edit invoices?",
    a: "Yes! Customers can add their VAT number, business details, and other information to customize their invoices before downloading.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-white" id="faq">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Left column - Title */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-8">
              <p className="text-green-600 font-semibold mb-2 uppercase tracking-wide">FAQ</p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Frequently Asked Questions
              </h2>
            </div>
          </div>
          
          {/* Right column - Questions */}
          <div className="lg:col-span-8">
            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                  <button
                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  >
                    <span className="font-semibold text-gray-900 text-lg">{faq.q}</span>
                    <div className="flex-shrink-0 ml-4">
                      <svg 
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                          openIndex === idx ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {openIndex === idx && (
                    <div className="px-6 pb-5 border-t border-gray-200">
                      <p className="text-gray-600 mt-4 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
