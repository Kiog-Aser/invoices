"use client";

import { useState } from "react";

export default function FeaturesAccordion() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const features = [
    {
      title: "Beautiful & Customizable",
      description: "Create stunning iOS-style notifications that match your brand and capture attention. Customize colors, positions, timing and more to perfectly fit your website's design.",
      icon: (
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      title: "Instant Setup",
      description: "Get started in seconds with just one line of code. Add it to your site and notifications start working immediately. No complex configuration required.",
      icon: (
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Increased Conversions",
      description: "Social proof and timely notifications have been shown to boost conversions by up to 37%. Engage visitors at the right moment to drive more sales and signups.",
      icon: (
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    }
  ];

  return (
    <section className="py-24 bg-base-200">
      <div className="max-w-5xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-base-content">Powerful Features</h2>
          <p className="text-xl text-base-content/60">
            Everything you need to boost engagement and conversions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image column */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-base-300">
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
          
          {/* Accordion column */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`border rounded-lg transition-all duration-200 ${
                  activeIndex === index
                    ? "border-primary bg-base-100 shadow-md"
                    : "border-base-300 bg-base-100"
                }`}
              >
                <button
                  className="w-full px-6 py-4 flex items-center gap-4 text-left"
                  onClick={() => setActiveIndex(index)}
                >
                  <div className={`p-2 rounded-lg ${
                    activeIndex === index
                      ? "bg-primary/10 text-primary"
                      : "bg-base-200 text-base-content/60"
                  }`}>
                    {feature.icon}
                  </div>
                  <span className="font-semibold text-base-content">{feature.title}</span>
                </button>
                
                {activeIndex === index && (
                  <div className="px-6 pb-4 text-base-content/80">
                    {feature.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
