"use client";

import { useState } from "react";
import { FaTimes, FaCheck, FaPowerOff } from "react-icons/fa";
import { FiCalendar, FiClock, FiTarget, FiUsers } from "react-icons/fi";

const WithWithout = () => {
  const [flicker, setFlicker] = useState(false);

  // Create flicker effect on hover for retro feel
  const handleMouseEnter = () => {
    setFlicker(true);
    setTimeout(() => setFlicker(false), 100);
    setTimeout(() => setFlicker(true), 200);
    setTimeout(() => setFlicker(false), 300);
  };

  return (
    <section id="solution" className="bg-base-200 min-h-[90vh] lg:min-h-screen flex items-center relative overflow-x-hidden">
      {/* No retro grid background to create zebra pattern alternation */}
      
      {/* Decorative elements - adjusted positioning to ensure they don't cause overflow */}
      <div className="absolute -top-10 right-[10%] w-40 h-40 bg-primary/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-40 left-[5%] w-60 h-60 bg-secondary/10 rounded-full blur-xl"></div>
      
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20 md:py-24 relative">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-base-100 rounded-xl shadow-md border border-base-content/10 mb-4 sm:mb-6 w-fit">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="font-mono text-xs sm:text-sm tracking-widest">SYSTEM COMPARISON</span>
          </div>
          <h2 className="font-bold font-mono text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-4">Content Creation Protocol</h2>
          <p className="text-base sm:text-lg text-base-content/70 max-w-2xl mx-auto font-mono">
            Break free from the content creation chaos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 mt-6 sm:mt-10 relative">
          {/* Divider line between columns (only visible on md and up) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary/50 to-transparent transform -translate-x-1/2"></div>
          
          {/* LEFT COLUMN - WITHOUT */}
          <div 
            className={`flex flex-col gap-3 sm:gap-4 md:gap-6 p-4 sm:p-6 md:p-8 bg-base-100 rounded-xl border-2 border-error shadow-[4px_4px_0px_0px_rgba(255,0,0,0.1)] ${flicker ? 'opacity-90' : ''}`}
            onMouseEnter={handleMouseEnter}
          >
            <div className="flex items-center gap-3 sm:gap-4 font-mono mb-1 sm:mb-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-error"></div>
              <h3 className="text-base sm:text-lg font-bold text-error uppercase">No Protocol</h3>
              <div className="flex-grow"></div>
              <FaPowerOff className="text-error/50" />
            </div>

            {/* Progress bar */}
            <div className="bg-base-300 h-1.5 sm:h-2 w-full rounded-full overflow-hidden mb-3 sm:mb-4">
              <div className="bg-error h-full w-[40%] rounded-full"></div>
            </div>
            
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="bg-base-200 p-3 sm:p-4 rounded-lg border border-base-content/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] flex gap-2 sm:gap-3 items-start hover:translate-y-[-2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)] transition-all duration-300">
                <div className="rounded-full p-1.5 sm:p-2 bg-error/10 text-error">
                  <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className="font-bold font-mono text-sm sm:text-base mb-0.5">Last-minute Content</h4>
                  <p className="text-xs sm:text-sm text-base-content/70 font-mono">Scrambling to decide what to post every morning</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-error/10 p-1 rounded-full">
                    <FaTimes className="text-error w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
              </div>

              <div className="bg-base-200 p-3 sm:p-4 rounded-lg border border-base-content/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] flex gap-2 sm:gap-3 items-start hover:translate-y-[-2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)] transition-all duration-300">
                <div className="rounded-full p-1.5 sm:p-2 bg-error/10 text-error">
                  <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className="font-bold font-mono text-sm sm:text-base mb-0.5">Inconsistent Posting</h4>
                  <p className="text-xs sm:text-sm text-base-content/70 font-mono">Inconsistent schedule with random topics and formats</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-error/10 p-1 rounded-full">
                    <FaTimes className="text-error w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
              </div>

              <div className="bg-base-200 p-3 sm:p-4 rounded-lg border border-base-content/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] flex gap-2 sm:gap-3 items-start hover:translate-y-[-2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)] transition-all duration-300">
                <div className="rounded-full p-1.5 sm:p-2 bg-error/10 text-error">
                  <FiTarget className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className="font-bold font-mono text-sm sm:text-base mb-0.5">Scattered Messaging</h4>
                  <p className="text-xs sm:text-sm text-base-content/70 font-mono">Confusing your audience with unfocused content</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-error/10 p-1 rounded-full">
                    <FaTimes className="text-error w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
              </div>

              <div className="bg-base-200 p-3 sm:p-4 rounded-lg border border-base-content/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] flex gap-2 sm:gap-3 items-start hover:translate-y-[-2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)] transition-all duration-300">
                <div className="rounded-full p-1.5 sm:p-2 bg-error/10 text-error">
                  <FiUsers className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className="font-bold font-mono text-sm sm:text-base mb-0.5">Unpredictable Growth</h4>
                  <p className="text-xs sm:text-sm text-base-content/70 font-mono">Slow follower acquisition with high audience churn</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-error/10 p-1 rounded-full">
                    <FaTimes className="text-error w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - WITH */}
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 p-4 sm:p-6 md:p-8 bg-base-100 rounded-xl border-2 border-success shadow-[4px_4px_0px_0px_rgba(0,200,0,0.1)]">
            <div className="flex items-center gap-3 sm:gap-4 font-mono mb-1 sm:mb-2 relative">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-success animate-pulse"></div>
              <h3 className="text-base sm:text-lg font-bold text-success uppercase">Protocol Active</h3>
              <div className="flex-grow"></div>
            </div>

            {/* Progress bar */}
            <div className="bg-base-300 h-1.5 sm:h-2 w-full rounded-full overflow-hidden mb-3 sm:mb-4">
              <div className="bg-success h-full w-[90%] rounded-full"></div>
            </div>

            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="bg-base-200 p-3 sm:p-4 rounded-lg border border-base-content/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] flex gap-2 sm:gap-3 items-start hover:translate-y-[-2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)] transition-all duration-300">
                <div className="rounded-full p-1.5 sm:p-2 bg-success/10 text-success">
                  <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className="font-bold font-mono text-sm sm:text-base mb-0.5">Clear Content Calendar</h4>
                  <p className="text-xs sm:text-sm text-base-content/70 font-mono">Pre-planned topics scheduled weeks in advance</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-success/10 p-1 rounded-full">
                    <FaCheck className="text-success w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
              </div>

              <div className="bg-base-200 p-3 sm:p-4 rounded-lg border border-base-content/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] flex gap-2 sm:gap-3 items-start hover:translate-y-[-2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)] transition-all duration-300">
                <div className="rounded-full p-1.5 sm:p-2 bg-success/10 text-success">
                  <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className="font-bold font-mono text-sm sm:text-base mb-0.5">Consistent Publishing</h4>
                  <p className="text-xs sm:text-sm text-base-content/70 font-mono">Regular, predictable posting to build audience habits</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-success/10 p-1 rounded-full">
                    <FaCheck className="text-success w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
              </div>

              <div className="bg-base-200 p-3 sm:p-4 rounded-lg border border-base-content/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] flex gap-2 sm:gap-3 items-start hover:translate-y-[-2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)] transition-all duration-300">
                <div className="rounded-full p-1.5 sm:p-2 bg-success/10 text-success">
                  <FiTarget className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className="font-bold font-mono text-sm sm:text-base mb-0.5">Strategic Content Pillars</h4>
                  <p className="text-xs sm:text-sm text-base-content/70 font-mono">Focused topics that establish your authority</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-success/10 p-1 rounded-full">
                    <FaCheck className="text-success w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
              </div>

              <div className="bg-base-200 p-3 sm:p-4 rounded-lg border border-base-content/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] flex gap-2 sm:gap-3 items-start hover:translate-y-[-2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)] transition-all duration-300">
                <div className="rounded-full p-1.5 sm:p-2 bg-success/10 text-success">
                  <FiUsers className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className="font-bold font-mono text-sm sm:text-base mb-0.5">Predictable Audience Growth</h4>
                  <p className="text-xs sm:text-sm text-base-content/70 font-mono">Targeted messaging that builds loyalty and engagement</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-success/10 p-1 rounded-full">
                    <FaCheck className="text-success w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA section */}
        <div className="mt-8 sm:mt-10 md:mt-12 text-center">
          <a 
            href="#pricing" 
            className="btn btn-primary btn-md sm:btn-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 font-mono"
          >
            Activate Your Protocol
          </a>
          <p className="text-xs sm:text-sm text-base-content/60 mt-2 sm:mt-3 font-mono">
            Join <span className="text-primary font-bold">312</span> creators who've systematized their content
          </p>
        </div>
      </div>
    </section>
  );
};

export default WithWithout;
