"use client";

import { useState, useEffect } from "react";
import { FaRobot, FaCalendarAlt, FaFileAlt, FaChevronRight } from "react-icons/fa";

const FeaturesAccordion = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);

  const features = [
    {
      title: "Writing Protocol",
      description: "Our AI analyzes your unique goals and audience to create a personalized content strategy that transforms how you create content.",
      icon: <FaRobot className="w-5 h-5" />,
      highlights: [
        "Strategic content pillars for niche authority",
        "Done-for-you content repurposing system",
        "Custom conversion funnel for your offers"
      ],
      color: "from-primary to-primary/70"
    },
    {
      title: "Weekly Content Calendar",
      description: "Say goodbye to decision fatigue with a done-for-you weekly content calendar that tells you exactly what to post and when.",
      icon: <FaCalendarAlt className="w-5 h-5" />,
      highlights: [
        "Perfect balance of educational & promotional content",
        "Platform-specific posting schedules",
        "One-click calendar export to your favorite tool"
      ],
      color: "from-secondary to-secondary/70"
    },
    {
      title: "Content Creation",
      description: "Stop staring at the blank page. Get professional templates and AI prompts for every content format you need to succeed.",
      icon: <FaFileAlt className="w-5 h-5" />,
      highlights: [
        "Copy-paste AI prompts for any platform",
        "Format-specific content frameworks",
        "Quality assurance checklists for perfect content"
      ],
      color: "from-accent to-accent/70"
    }
  ];

  // Handle animation when switching features
  useEffect(() => {
    setAnimateIn(false);
    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [activeFeature]);

  return (
    <section className="bg-base-300 min-h-[90vh] lg:min-h-screen flex items-center relative overflow-hidden" id="features">
      {/* Retro grid background - adding back for alternating pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-[length:20px_20px] opacity-25"></div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-xl"></div>
      <div className="absolute top-40 left-20 w-60 h-60 bg-secondary/10 rounded-full blur-xl"></div>
      
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20 md:py-24 relative">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-base-100 rounded-xl shadow-md border border-base-content/10 mb-4 sm:mb-6 w-fit">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="font-mono text-xs sm:text-sm tracking-widest">KEY FEATURES</span>
          </div>
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-4 font-mono">Protocol Generator System</h2>
          <p className="text-base sm:text-lg text-base-content/70 max-w-2xl mx-auto">
            Stop the endless content struggle with our powerful content creation tools
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-4 sm:gap-6 md:gap-8 items-start">
          {/* Feature selector - Left sidebar */}
          <div className="md:col-span-2 bg-base-100 rounded-xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 order-2 md:order-1">
            <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 font-mono">Select Feature</h3>
            
            <div className="space-y-2 sm:space-y-3">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-full text-left p-2 sm:p-4 rounded-lg transition-all flex items-center gap-2 sm:gap-3 font-mono text-sm sm:text-base ${
                    activeFeature === index 
                      ? "bg-primary/10 text-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border border-primary/30" 
                      : "hover:bg-base-200 border border-transparent"
                  }`}
                >
                  <div className={`p-1 sm:p-2 rounded ${activeFeature === index ? "bg-primary/20" : "bg-base-200"}`}>
                    {feature.icon}
                  </div>
                  <div className="font-bold">{feature.title}</div>
                  {activeFeature === index && <FaChevronRight className="ml-auto" />}
                </button>
              ))}
            </div>
            
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-base-content/10">
              <div className="text-center text-xs sm:text-sm text-base-content/60 font-mono">
                <div className="w-2 h-2 rounded-full bg-success inline-block mr-2 animate-pulse"></div> 
                <span>All features included in every plan</span>
              </div>
            </div>
          </div>

          {/* Feature display - Right side */}
          <div className="md:col-span-3 order-1 md:order-2">
            <div className="bg-base-100 rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 h-full">
              {/* Feature header with gradient */}
              <div className={`bg-gradient-to-r ${features[activeFeature].color} p-4 sm:p-6 relative`}>
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 sm:gap-2">
                  <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-base-100/30"></div>
                  <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-base-100/30"></div>
                  <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-base-100/30"></div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-white/10 rounded-full">
                    {features[activeFeature].icon}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-white mb-0 sm:mb-1 font-mono">{features[activeFeature].title}</h3>
                    <p className="text-white/80 text-xs sm:text-sm">{features[activeFeature].description}</p>
                  </div>
                </div>
              </div>
              
              {/* Feature content */}
              <div className="p-4 sm:p-6">
                <div className={`transition-all duration-300 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <h4 className="font-medium mb-3 sm:mb-4 text-base-content/70 font-mono text-sm">What you get:</h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {features[activeFeature].highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-base-200/50 rounded-lg border border-base-content/5">
                        <div className="bg-primary/10 text-primary p-1 rounded-full flex-shrink-0 mt-0.5 sm:mt-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        <span className="font-mono text-xs sm:text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA button */}
        <div className="text-center mt-8 sm:mt-12 md:mt-16">
          <a href="/dashboard" className="btn btn-primary btn-md sm:btn-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 font-mono">
            Create Your Protocol
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-3.293-3.293a1 1 0 111.414-1.414l4 4z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturesAccordion;
