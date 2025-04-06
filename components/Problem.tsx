"use client";

import { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";

const ProblemStep = ({ number, title, description }: { number: string; title: string; description: string }) => {
  return (
    <div className="w-full bg-base-100 rounded-xl p-6 shadow-md border border-base-300 hover:border-primary/20 transition-all duration-300 hover:translate-y-[-5px]">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center font-bold text-primary text-lg">
          {number}
        </div>
        
        <div className="text-left">
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <p className="text-base-content/70">{description}</p>
        </div>
      </div>
    </div>
  );
};

const Arrow = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="hidden md:block w-12 h-12 text-primary/40">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14"></path>
        <path d="M12 5l7 7-7 7"></path>
      </svg>
    </div>
    <div className="md:hidden w-12 h-12 text-primary/40 rotate-90">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14"></path>
        <path d="M12 5l7 7-7 7"></path>
      </svg>
    </div>
  </div>
);

const Problem = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="bg-base-200 py-20 md:py-28 relative overflow-hidden">
      {/* Subtle pattern background - not overwhelming */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.07)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30"></div>
      
      <div className="max-w-6xl mx-auto px-8 relative">
        <div className="text-center mb-16">
          <div className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-md mb-4 font-medium tracking-wider text-sm">
            THE CHALLENGE
          </div>
          
          <h2 className="font-bold text-3xl md:text-4xl mb-6 mx-auto max-w-3xl">
            Content creation <span className="text-primary">shouldn't be chaotic</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-base-content/80 text-lg mb-8">
            Without a clear strategy, creators waste time, produce inconsistent content, and struggle to build a loyal audience.
          </p>
        </div>

        <div className={`flex flex-col md:flex-row items-center justify-center gap-4 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full md:w-1/3">
            <ProblemStep 
              number="01"
              title="Idea Overwhelm" 
              description="Too many ideas, no clear direction on what to post next. You spend hours stuck in decision paralysis."
            />
          </div>
          
          <Arrow />
          
          <div className="w-full md:w-1/3">
            <ProblemStep 
              number="02"
              title="Inconsistent Posting" 
              description="Random posting schedule confuses algorithms and audience. Your growth remains stagnant despite your efforts."
            />
          </div>
          
          <Arrow />
          
          <div className="w-full md:w-1/3">
            <ProblemStep 
              number="03"
              title="Audience Disconnect" 
              description="Your content lacks cohesive strategy, failing to build authority. Audience grows slowly with high churn."
            />
          </div>
        </div>
        
        <div className="text-center mt-16">
          <div className="inline-block">
            <a href="#solution" className="btn btn-primary btn-lg shadow-md group">
              See the solution
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="text-sm text-base-content/60 mt-4">
              A systematic approach to content creation
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
