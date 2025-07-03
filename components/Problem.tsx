"use client";

import { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";

const ProblemStep = ({ number, title, description }: { number: string; title: string; description: string }) => {
  return (
    <div className="w-full bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 hover:border-green-300 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center font-bold text-red-600 text-lg">
          {number}
        </div>
        
        <div className="text-left">
          <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-gray-800">{title}</h3>
          <p className="text-gray-600 text-xs sm:text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};

const Arrow = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="hidden md:block w-8 h-8 sm:w-12 sm:h-12 text-red-400">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14"></path>
        <path d="M12 5l7 7-7 7"></path>
      </svg>
    </div>
    <div className="md:hidden w-8 h-8 sm:w-12 sm:h-12 text-red-400 rotate-90">
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
    <section className="bg-gray-50 min-h-[90vh] lg:min-h-screen flex items-center relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-40 h-40 bg-red-200/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-20 w-60 h-60 bg-red-300/20 rounded-full blur-xl"></div>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 relative py-16 sm:py-20 md:py-24">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-white rounded-xl shadow-md border border-red-200 mb-4 sm:mb-6">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-xs sm:text-sm tracking-widest text-red-600 font-semibold">THE PROBLEM</span>
          </div>
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 mx-auto max-w-3xl text-gray-800">
            Stripe's invoice fees are <span className="text-red-600">eating your profits</span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
            Every time a customer needs an invoice, you pay 0.4% to Stripe. For high-volume businesses, this adds up to thousands per year.
          </p>
        </div>
        <div className={`flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full md:w-1/3">
            <ProblemStep 
              number="💸"
              title="Expensive Invoice Fees" 
              description="0.4% fee per invoice request adds up quickly. $10,000 in invoices = $40 in fees just for customer access."
            />
          </div>
          <Arrow />
          <div className="w-full md:w-1/3">
            <ProblemStep 
              number="😤"
              title="Customer Frustration" 
              description="Customers have to contact you every time they need a copy of their invoice. More support tickets for you."
            />
          </div>
          <Arrow />
          <div className="w-full md:w-1/3">
            <ProblemStep 
              number="⏰"
              title="Time Consuming" 
              description="Manually sending invoices and handling customer requests takes time away from growing your business."
            />
          </div>
        </div>
        <div className="text-center mt-8 sm:mt-12 md:mt-16">
          <div className="inline-block">
            <a href="#pricing" className="btn btn-success btn-md sm:btn-lg shadow-lg hover:shadow-xl transition-all duration-200">
              See the solution
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="text-sm text-gray-500 mt-3 sm:mt-4">
              Save money and time with our invoice solution
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
