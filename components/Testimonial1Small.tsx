import Image from "next/image";
import { useState, useEffect } from "react";
import config from "@/config";

const TESTIMONIALS = [
  {
    name: "Alex Founder",
    role: "Indie Hacker",
    text: "This boilerplate saved me weeks of setup. Auth, payments, and dashboard just worked!",
    image: "/opengraph-image.png",
  },
  {
    name: "Jamie Dev",
    role: "Full Stack Developer",
    text: "The code quality is excellent and the UI is beautiful out of the box.",
    image: "/apple-icon.png",
  },
  {
    name: "Morgan Startup",
    role: "SaaS Builder",
    text: "I launched my MVP in days, not months. Highly recommend for any SaaS founder.",
    image: "/icon.png",
  },
];

export default function Testimonial1Small() {
  return (
    <section className="py-16 bg-base-100">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center font-mono">What founders are saying</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card bg-base-200 p-6 rounded-xl shadow border border-base-content/10 flex flex-col items-center text-center">
              <img src={t.image} alt={t.name} width={64} height={64} className="rounded-full mb-4 object-cover" loading="lazy" />
              <p className="text-base-content/80 font-mono mb-4">“{t.text}”</p>
              <div className="font-bold font-mono">{t.name}</div>
              <div className="text-base-content/60 text-sm font-mono">{t.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
