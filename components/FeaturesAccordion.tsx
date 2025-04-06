"use client";

import { useState, useEffect } from "react";
import { FaRobot, FaCalendarAlt, FaFileAlt, FaChevronRight } from "react-icons/fa";

const FeaturesAccordion = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);

  const features = [
    {
      title: "Writing Protocol",
      description: "Our advanced AI analyzes your goals and audience to create a personalized content strategy with content pillars, formats, and posting schedules.",
      icon: <FaRobot className="w-5 h-5" />,
      highlights: [
        "Detailed niche analysis",
        "Content pillars & repurpose system",
        "Conversion funnel"
      ],
      color: "from-primary to-primary/70"
    },
    {
      title: "Weekly Content Calendar",
      description: "Eliminate decision fatigue with an optimized content calendar that balances educational and promotional content in the perfect ratio for growth.",
      icon: <FaCalendarAlt className="w-5 h-5" />,
      highlights: [
        "Optimised posting schedule",
        "Content types for each day",
        "One-click calendar export",

      ],
      color: "from-secondary to-secondary/70"
    },
    {
      title: "Content Creation",
      description: "Get professional templates for every content format. From carousel posts to video scripts, email sequences, and more - just fill in the blanks.",
      icon: <FaFileAlt className="w-5 h-5" />,
      highlights: [
        "Multiple social media formats",
        "Copy-pastable AI prompts",
        "Guided content creation system"
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
    <section className="py-24 bg-base-300" id="features">
      <div className="max-w-6xl mx-auto px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-base-100 rounded-xl shadow-md border border-base-content/10 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="font-mono text-sm tracking-widest">KEY FEATURES</span>
          </div>
          <h2 className="font-bold text-3xl md:text-4xl mb-4">Protocol Generator System</h2>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Powerful features that transform how you create content
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Feature selector - Left sidebar */}
          <div className="md:col-span-2 bg-base-100 rounded-xl p-6 shadow-xl border border-base-300 order-2 md:order-1">
            <h3 className="text-base font-semibold mb-4">Select Feature</h3>
            
            <div className="space-y-3">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-full text-left p-4 rounded-lg transition-all flex items-center gap-3 ${
                    activeFeature === index 
                      ? "bg-primary/10 text-primary border border-primary/30" 
                      : "hover:bg-base-200 border border-transparent"
                  }`}
                >
                  <div className={`p-2 rounded ${activeFeature === index ? "bg-primary/20" : "bg-base-200"}`}>
                    {feature.icon}
                  </div>
                  <div className="font-bold">{feature.title}</div>
                  {activeFeature === index && <FaChevronRight className="ml-auto" />}
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-base-content/10">
              <div className="text-center text-sm text-base-content/60">
                <div className="w-2 h-2 rounded-full bg-success inline-block mr-2 animate-pulse"></div> 
                <span>All features included in every plan</span>
              </div>
            </div>
          </div>

          {/* Feature display - Right side */}
          <div className="md:col-span-3 order-1 md:order-2">
            <div className="bg-base-100 rounded-xl overflow-hidden shadow-xl border border-base-300 h-full">
              {/* Feature header with gradient */}
              <div className={`bg-gradient-to-r ${features[activeFeature].color} p-6 relative`}>
                <div className="absolute top-2 right-2 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-base-100/30"></div>
                  <div className="w-3 h-3 rounded-full bg-base-100/30"></div>
                  <div className="w-3 h-3 rounded-full bg-base-100/30"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-full">
                    {features[activeFeature].icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{features[activeFeature].title}</h3>
                    <p className="text-white/80 text-sm">{features[activeFeature].description}</p>
                  </div>
                </div>
              </div>
              
              {/* Feature content */}
              <div className="p-6">
                <div className={`transition-all duration-300 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <h4 className="font-medium mb-4 text-base-content/70">What you get:</h4>
                  <ul className="space-y-3">
                    {features[activeFeature].highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-base-200/50 rounded-lg">
                        <div className="bg-primary/10 text-primary p-1 rounded-full flex-shrink-0 mt-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA button */}
        <div className="text-center mt-16">
          <a href="#pricing" className="btn btn-primary btn-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200">
            Get Your Protocol
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-3.293-3.293a1 1 0 111.414-1.414l4 4z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturesAccordion;
