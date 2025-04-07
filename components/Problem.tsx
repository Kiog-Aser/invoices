"use client";

import { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";

const ProblemStep = ({ number, title, description }: { number: string; title: string; description: string }) => {
  return (
    <div className="w-full bg-base-100 rounded-xl p-4 sm:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 hover:border-primary/20 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-base-200 flex items-center justify-center font-bold font-mono text-primary text-lg">
          {number}
        </div>
        
        <div className="text-left">
          <h3 className="font-bold font-mono text-base sm:text-lg mb-1 sm:mb-2">{title}</h3>
          <p className="text-base-content/70 font-mono text-xs sm:text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};

const Arrow = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="hidden md:block w-8 h-8 sm:w-12 sm:h-12 text-primary/40">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14"></path>
        <path d="M12 5l7 7-7 7"></path>
      </svg>
    </div>
    <div className="md:hidden w-8 h-8 sm:w-12 sm:h-12 text-primary/40 rotate-90">
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
    <section className="bg-base-200 min-h-[90vh] lg:min-h-screen flex items-center relative overflow-hidden">
      {/* No retro grid background to create zebra pattern alternation */}
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-40 h-40 bg-primary/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-20 w-60 h-60 bg-secondary/10 rounded-full blur-xl"></div>
      
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 relative py-16 sm:py-20 md:py-24">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-base-100 rounded-xl shadow-md border border-base-content/10 mb-4 sm:mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="font-mono text-xs sm:text-sm tracking-widest">THE CHALLENGE</span>
          </div>
          
          <h2 className="font-bold font-mono text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 mx-auto max-w-3xl">
            Content creation <span className="text-primary">shouldn't be chaotic</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-base-content/80 text-base sm:text-lg mb-6 sm:mb-8 font-mono">
            Without a clear strategy, creators waste time, produce inconsistent content, and struggle to build a loyal audience.
          </p>
        </div>

        <div className={`flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
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
        
        <div className="text-center mt-8 sm:mt-12 md:mt-16">
          <div className="inline-block">
            <a href="#solution" className="btn btn-primary btn-md sm:btn-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 font-mono">
              See the solution
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="text-sm text-base-content/60 mt-3 sm:mt-4 font-mono">
              A systematic approach to content creation
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
