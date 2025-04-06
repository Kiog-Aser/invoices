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
    <section className="bg-base-200 py-20 overflow-hidden relative">
      {/* Retro grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40"></div>
      
      <div className="max-w-6xl mx-auto px-8 relative">
        <div className="text-center mb-12">
          <div className="font-mono text-sm tracking-widest inline-block bg-primary/10 text-primary px-4 py-1 rounded-md mb-4">
            SYSTEM COMPARISON
          </div>
          <h2 className="font-bold text-3xl md:text-4xl mb-4">Content Creation Protocol</h2>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Break free from the content creation chaos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mt-10 relative">
          {/* Divider line between columns (only visible on md and up) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary/50 to-transparent transform -translate-x-1/2"></div>
          
          {/* LEFT COLUMN - WITHOUT */}
          <div 
            className={`flex flex-col gap-6 p-6 md:p-8 bg-base-200 rounded-xl border-2 border-error shadow-xl ${flicker ? 'opacity-90' : ''}`}
            onMouseEnter={handleMouseEnter}
          >
            <div className="flex items-center gap-4 font-mono mb-2">
              <div className="w-4 h-4 rounded-full bg-error"></div>
              <h3 className="text-lg font-bold text-error uppercase">No Protocol</h3>
              <div className="flex-grow"></div>
              <FaPowerOff className="text-error/50" />
            </div>

            {/* Progress bar */}
            <div className="bg-base-300 h-2 w-full rounded-full overflow-hidden mb-4">
              <div className="bg-error h-full w-[40%] rounded-full"></div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-base-100 p-4 rounded-lg border border-base-300 flex gap-3 items-start hover:translate-y-[-5px] transition-transform duration-300">
                <div className="rounded-full p-2 bg-error/10 text-error">
                  <FiCalendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold mb-0.5">Last-minute Content</h4>
                  <p className="text-sm text-base-content/70">Scrambling to decide what to post every morning</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-error/10 p-1 rounded-full">
                    <FaTimes className="text-error w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="bg-base-100 p-4 rounded-lg border border-base-300 flex gap-3 items-start hover:translate-y-[-5px] transition-transform duration-300">
                <div className="rounded-full p-2 bg-error/10 text-error">
                  <FiClock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold mb-0.5">Inconsistent Posting</h4>
                  <p className="text-sm text-base-content/70">Inconsistent schedule with random topics and formats</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-error/10 p-1 rounded-full">
                    <FaTimes className="text-error w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="bg-base-100 p-4 rounded-lg border border-base-300 flex gap-3 items-start hover:translate-y-[-5px] transition-transform duration-300">
                <div className="rounded-full p-2 bg-error/10 text-error">
                  <FiTarget className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold mb-0.5">Scattered Messaging</h4>
                  <p className="text-sm text-base-content/70">Confusing your audience with unfocused content</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-error/10 p-1 rounded-full">
                    <FaTimes className="text-error w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="bg-base-100 p-4 rounded-lg border border-base-300 flex gap-3 items-start hover:translate-y-[-5px] transition-transform duration-300">
                <div className="rounded-full p-2 bg-error/10 text-error">
                  <FiUsers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold mb-0.5">Unpredictable Growth</h4>
                  <p className="text-sm text-base-content/70">Slow follower acquisition with high audience churn</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-error/10 p-1 rounded-full">
                    <FaTimes className="text-error w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - WITH */}
          <div className="flex flex-col gap-6 p-6 md:p-8 bg-base-100 rounded-xl border-2 border-success shadow-xl">
            <div className="flex items-center gap-4 font-mono mb-2 relative">
              <div className="w-4 h-4 rounded-full bg-success animate-pulse"></div>
              <h3 className="text-lg font-bold text-success uppercase">Protocol Active</h3>
              <div className="flex-grow"></div>
            </div>

            {/* Progress bar */}
            <div className="bg-base-300 h-2 w-full rounded-full overflow-hidden mb-4">
              <div className="bg-success h-full w-[90%] rounded-full"></div>
            </div>

            <div className="space-y-4">
              <div className="bg-base-200 p-4 rounded-lg border border-base-300 flex gap-3 items-start hover:translate-y-[-5px] transition-transform duration-300">
                <div className="rounded-full p-2 bg-success/10 text-success">
                  <FiCalendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold mb-0.5">Clear Content Calendar</h4>
                  <p className="text-sm text-base-content/70">Pre-planned topics scheduled weeks in advance</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-success/10 p-1 rounded-full">
                    <FaCheck className="text-success w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="bg-base-200 p-4 rounded-lg border border-base-300 flex gap-3 items-start hover:translate-y-[-5px] transition-transform duration-300">
                <div className="rounded-full p-2 bg-success/10 text-success">
                  <FiClock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold mb-0.5">Consistent Publishing</h4>
                  <p className="text-sm text-base-content/70">Regular, predictable posting to build audience habits</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-success/10 p-1 rounded-full">
                    <FaCheck className="text-success w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="bg-base-200 p-4 rounded-lg border border-base-300 flex gap-3 items-start hover:translate-y-[-5px] transition-transform duration-300">
                <div className="rounded-full p-2 bg-success/10 text-success">
                  <FiTarget className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold mb-0.5">Strategic Content Pillars</h4>
                  <p className="text-sm text-base-content/70">Focused topics that establish your authority</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-success/10 p-1 rounded-full">
                    <FaCheck className="text-success w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="bg-base-200 p-4 rounded-lg border border-base-300 flex gap-3 items-start hover:translate-y-[-5px] transition-transform duration-300">
                <div className="rounded-full p-2 bg-success/10 text-success">
                  <FiUsers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold mb-0.5">Predictable Audience Growth</h4>
                  <p className="text-sm text-base-content/70">Targeted messaging that builds loyalty and engagement</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-success/10 p-1 rounded-full">
                    <FaCheck className="text-success w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA section */}
        <div className="mt-12 text-center">
          <a 
            href="#pricing" 
            className="btn btn-primary btn-lg font-mono normal-case"
          >
            Activate Your Protocol
          </a>
          <p className="text-sm text-base-content/60 mt-3">
            Join <span className="text-primary font-bold">312</span> creators who've systematized their content
          </p>
        </div>
      </div>
    </section>
  );
};

export default WithWithout;
