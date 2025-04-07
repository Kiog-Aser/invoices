import TestimonialsSmall from "./TestimonialsSmall";

const Hero = () => {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex flex-col justify-center bg-base-300 overflow-hidden relative">
      {/* Retro grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-[length:20px_20px] opacity-25"></div>
      
      {/* Decorative elements */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-xl"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-secondary/10 rounded-full blur-xl"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        {/* Retro Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-base-100 rounded-xl shadow-md border border-base-content/10 mb-4 sm:mb-6">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
          <span className="font-mono text-sm uppercase tracking-widest text-primary">Writing Protocol System</span>
        </div>
        
        {/* Headline with Retro Style */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 mx-auto max-w-4xl font-mono">
          The <span className="text-primary border-primary">ultimate</span> system for consistent content
        </h1>
        
        {/* Subtitle */}
        <p className="text-base sm:text-lg mb-6 sm:mb-8 text-base-content/80 max-w-2xl mx-auto">
          Stop the endless content struggle. Create a structured writing protocol that eliminates frustration and delivers results.
        </p>
        
        
        {/* Feature Checks with Retro Style */}
        <div className="flex flex-col items-center justify-center gap-3 mb-6 sm:mb-8 max-w-md mx-auto">
          <div className="flex items-center gap-2 bg-base-100 px-4 py-2 rounded-lg shadow-md border border-base-content/10 w-full sm:w-[50%] justify-center">
            <div className="rounded-full p-1 bg-primary/20 text-primary">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
            </div>
            <span className="font-medium font-mono text-sm">Custom content pillars</span>
          </div>
          <div className="flex items-center gap-2 bg-base-100 px-4 py-2 rounded-lg shadow-md border border-base-content/10 w-full sm:w-[50%] justify-center">
            <div className="rounded-full p-1 bg-primary/20 text-primary">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
            </div>
            <span className="font-medium font-mono text-sm">Weekly content calendar</span>
          </div>
          <div className="flex items-center gap-2 bg-base-100 px-4 py-2 rounded-lg shadow-md border border-base-content/10 w-full sm:w-[50%] justify-center">
            <div className="rounded-full p-1 bg-primary/20 text-primary">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
            </div>
            <span className="font-medium font-mono text-sm">Ready-to-use prompts</span>
          </div>
        </div>
        
        {/* CTA Buttons with Retro Style */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8">
          <a href="/dashboard" className="btn btn-primary btn-md sm:btn-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 font-mono">
            Create Your Protocol
          </a>
          <a href="#pricing" className="btn btn-outline btn-md sm:btn-lg border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 font-mono">
            View Pricing
          </a>
        </div>
        
        {/* Featured Testimonial with Arrow */}
        <div className="flex flex-col items-center justify-center mt-2">
          <div className="mb-2 opacity-60">
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-bounce">
              <path d="M10 0L19.5263 11.25H0.473721L10 0Z" fill="currentColor" />
            </svg>
          </div>
          <TestimonialsSmall priority />
        </div>
      
      </div>
    </section>
  );
};

export default Hero;
