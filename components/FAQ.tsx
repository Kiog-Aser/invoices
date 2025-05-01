"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";

const FAQS = [
  {
    q: "Is this really production-ready?",
    a: "Yes! All best practices for security, performance, and SEO are included. Just add your business logic and launch.",
  },
  {
    q: "What tech stack is used?",
    a: "TypeScript, Next.js App Router, Tailwind CSS, DaisyUI, NextAuth, MongoDB, and Stripe.",
  },
  {
    q: "Can I use this for any SaaS?",
    a: "Absolutely. The boilerplate is designed to be flexible for any SaaS use case.",
  },
  {
    q: "Is support included?",
    a: "You get lifetime updates and access to the community. For custom support, add your own channels.",
  },
];

export default function FAQ() {
  return (
    <section className="py-20 bg-base-200">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center font-mono">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={faq.q} className="collapse collapse-arrow bg-base-100 border border-base-content/10 rounded-xl">
              <input type="checkbox" defaultChecked={idx === 0} />
              <div className="collapse-title text-lg font-bold font-mono">{faq.q}</div>
              <div className="collapse-content text-base-content/80 font-mono">{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
