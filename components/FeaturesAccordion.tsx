"use client";

import { useState, useEffect } from "react";
import { FaRobot, FaCalendarAlt, FaFileAlt, FaChevronRight } from "react-icons/fa";

const FEATURES = [
  {
    title: "Authentication",
    description: "Secure, production-ready auth with NextAuth. Social logins included.",
  },
  {
    title: "Payments",
    description: "Stripe integration for subscriptions and one-time payments.",
  },
  {
    title: "User Dashboard",
    description: "Beautiful, responsive dashboard UI built with Tailwind and DaisyUI.",
  },
  {
    title: "API & Database",
    description: "Type-safe API routes and MongoDB/Mongoose models out of the box.",
  },
  {
    title: "Production Ready",
    description: "SEO, analytics, error handling, and more—all set up for you.",
  },
];

export default function FeaturesAccordion() {
  return (
    <section className="py-20 bg-base-100">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center font-mono">What’s Included?</h2>
        <div className="space-y-4">
          {FEATURES.map((feature, idx) => (
            <div key={feature.title} className="collapse collapse-arrow bg-base-200 border border-base-content/10 rounded-xl">
              <input type="checkbox" defaultChecked={idx === 0} />
              <div className="collapse-title text-lg font-bold font-mono">{feature.title}</div>
              <div className="collapse-content text-base-content/80 font-mono">{feature.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
