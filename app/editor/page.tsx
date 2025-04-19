import Link from 'next/link';
import ButtonCheckout from '@/components/ButtonCheckout'; // Import ButtonCheckout
import HeaderLanding from './HeaderLanding';

// Placeholder icons (replace with actual icons or illustrations if available)
const FeatureIcon = ({ d }: { d: string }) => (
  <svg className="w-12 h-12 mb-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

export default function EditorLanding() {
  // TODO: Replace with your actual Stripe Price IDs
  const monthlyPriceId = "price_1RFKyoG19CrUMKRaPjs8bVgp"; 
  const yearlyPriceId = "price_1RFKzBG19CrUMKRaLcQJ1SlD"; 

  return (
    <main className="min-h-screen bg-base-100 text-base-content font-mono antialiased">
      <HeaderLanding />
      {/* Hero Section */}
      <section id="hero" className="min-h-[90vh] lg:min-h-screen flex items-center relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-28 bg-base-300">
        {/* Retro grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-[length:20px_20px] opacity-25"></div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-20 right-[10%] w-40 h-40 bg-primary/5 rounded-full blur-xl"></div>
        <div className="absolute top-40 left-[5%] w-60 h-60 bg-secondary/5 rounded-full blur-xl"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight font-mono">
              Write Smarter,<br/>Not Harder.
            </h1>
            
            {/* Feature checkboxes instead of paragraph */}
            <div className="max-w-2xl mx-auto mb-10 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <span className="font-mono text-base-content/80">AI-powered writing assistance</span>
              </div>
              <div className="flex items-center justify-center mb-3">
                <div className="rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <span className="font-mono text-base-content/80">Advanced grammar checking</span>
              </div>
              <div className="flex items-center justify-center mb-3">
                <div className="rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <span className="font-mono text-base-content/80">Readability analysis tools</span>
              </div>
            </div>
            
            {/* Single CTA button */}
            <div className="flex justify-center">
              <ButtonCheckout
                priceId={yearlyPriceId}
                mode="subscription"
                className="btn btn-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 px-10 py-3 text-lg"
              >
                Start Writing Today - $50/yr
              </ButtonCheckout>
            </div>
            <p className="mt-4 text-sm text-base-content/60 font-mono">
              <span className="ml-2">
                Or <ButtonCheckout 
                  priceId={monthlyPriceId} 
                  mode="subscription" 
                  asLink={true} 
                  className="font-bold underline hover:text-primary transition"
                >
                  start monthly for $5
                </ButtonCheckout>.
              </span>
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="relative">
              {/* Editor illustration with frame effect */}
              <img 
                src="/editor-illustration.svg" 
                alt="AI Writing Editor Illustration" 
                className="w-full max-w-2xl relative z-10 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
              />
              {/* Decorative elements behind image */}
              <div className="absolute -bottom-4 -right-4 w-full max-w-2xl h-full rounded-lg bg-primary/20 z-0"></div>
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-secondary/30 rounded-full blur-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-base-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-base-300 rounded-xl shadow-md border border-base-content/10 mb-6">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
              <span className="font-mono text-sm tracking-widest">CAPABILITIES</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-base-content font-mono">One Editor, Infinite Possibilities</h2>
            <p className="text-center text-lg text-base-content/70 mb-12 max-w-2xl mx-auto">Consolidate your writing stack and unlock peak productivity with features designed for modern writers.</p>
          </div>
          <div className="grid gap-10 md:gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-base-200 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 transition-all duration-300">
              <div className="p-3 bg-primary/10 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-base-content font-mono">Intelligent AI Assistance</h3>
              <p className="text-base-content/70">Generate ideas, draft content, rewrite sentences, and overcome writer's block instantly.</p>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-base-200 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 transition-all duration-300">
              <div className="p-3 bg-secondary/10 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-base-content font-mono">Advanced Proofreading</h3>
              <p className="text-base-content/70">Catch complex grammar errors, spelling mistakes, and punctuation issues with precision.</p>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-base-200 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 transition-all duration-300">
              <div className="p-3 bg-accent/10 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-base-content font-mono">Readability Analysis</h3>
              <p className="text-base-content/70">Improve clarity, conciseness, and engagement with real-time feedback based on proven metrics.</p>
            </div>
            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center p-6 bg-base-200 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 transition-all duration-300">
              <div className="p-3 bg-primary/10 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-base-content font-mono">Secure & Private</h3>
              <p className="text-base-content/70">Your writing is yours. We use top-tier encryption and never sell your data.</p>
            </div>
            {/* Feature 5 */}
            <div className="flex flex-col items-center text-center p-6 bg-base-200 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 transition-all duration-300">
              <div className="p-3 bg-secondary/10 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-base-content font-mono">Incredible Value</h3>
              <p className="text-base-content/70">Replace multiple subscriptions with one affordable plan. Simple, transparent pricing.</p>
            </div>
            {/* Feature 6 */}
            <div className="flex flex-col items-center text-center p-6 bg-base-200 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 transition-all duration-300">
              <div className="p-3 bg-accent/10 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-base-content font-mono">Streamlined Workflow</h3>
              <p className="text-base-content/70">Focus on your writing, not on switching tabs. Everything you need, right where you need it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-base-300 relative overflow-hidden">
        {/* Retro grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-[length:20px_20px] opacity-25"></div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-20 left-[10%] w-40 h-40 bg-primary/5 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-[5%] w-60 h-60 bg-secondary/5 rounded-full blur-xl"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-base-100 rounded-xl shadow-md border border-base-content/10 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="font-mono text-sm tracking-widest">SIMPLE PRICING</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-base-content font-mono">Choose Your Perfect Plan</h2>
          <p className="text-center text-lg text-base-content/70 mb-12 max-w-xl mx-auto">Transparent pricing with no hidden fees. Cancel or switch anytime.</p>
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className="bg-base-100 p-8 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-300 border border-base-content/10 flex flex-col flex-1">
              <h3 className="text-2xl font-bold mb-2 font-mono text-base-content">Monthly</h3>
              <p className="text-base-content/70 mb-6">Perfect for trying things out.</p>
              <p className="text-5xl font-bold mb-4 text-base-content font-mono">$5<span className="text-xl font-medium text-base-content/60">/mo</span></p>
              <ul className="mb-8 space-y-3 text-left flex-grow">
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="font-mono text-base-content/80">Unlimited AI Assistance</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="font-mono text-base-content/80">Advanced Grammar & Spelling</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="font-mono text-base-content/80">Readability Analysis</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="font-mono text-base-content/80">Secure Cloud Sync</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-success/20 text-success mr-3 flex-shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="font-mono text-base-content/80">Priority Support</span>
                </li>
              </ul>
              <ButtonCheckout
                priceId={monthlyPriceId}
                mode="subscription"
                className="btn btn-outline font-mono border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 w-full mt-auto py-3"
              >
                Get Started Monthly
              </ButtonCheckout>
            </div>
            
            {/* Yearly Plan - Highlighted */}
            <div className="bg-primary text-primary-content p-8 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col flex-1 relative border-2 border-primary-content/20">
               <span className="absolute -top-4 -right-4 bg-accent text-accent-content font-mono text-xs font-bold px-4 py-1 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transform rotate-3">BEST VALUE</span>
              <h3 className="text-2xl font-bold mb-2 font-mono">Yearly</h3>
              <p className="text-primary-content/80 mb-6">Save 16% and focus on writing.</p>
              <p className="text-5xl font-bold mb-4 font-mono">$50<span className="text-xl font-medium text-primary-content/70">/yr</span></p>
              <ul className="mb-8 space-y-3 text-left flex-grow">
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-white/30 text-white mr-3 flex-shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="font-mono">Everything in Monthly</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-white/30 text-white mr-3 flex-shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="font-mono font-bold">Save $10 per year</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 rounded-full p-1 bg-white/30 text-white mr-3 flex-shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="font-mono">Early access to new features</span>
                </li>
              </ul>
              <ButtonCheckout
                priceId={yearlyPriceId}
                mode="subscription"
                className="btn bg-base-100 hover:bg-base-200 text-base-content border-none font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 w-full mt-auto py-3"
              >
                Go Yearly & Save
              </ButtonCheckout>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="feedback" className="py-20 bg-base-100 relative">
        <div className="absolute right-0 top-0 w-1/3 h-1/3 bg-gradient-to-bl from-primary/10 to-transparent opacity-60"></div>
        <div className="absolute left-0 bottom-0 w-1/3 h-1/3 bg-gradient-to-tr from-secondary/10 to-transparent opacity-60"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-base-300 rounded-xl shadow-md border border-base-content/10 mb-6">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
              <span className="font-mono text-sm tracking-widest">TESTIMONIALS</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-base-content font-mono">Loved by Writers Like You</h2>
            <p className="text-center text-lg text-base-content/70 mb-12 max-w-2xl mx-auto">See what our community has to say about the CreatiFun editor experience</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="p-6 border border-base-content/10 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-300 bg-base-200 relative">
              {/* Decorative quote mark */}
              <div className="absolute -top-4 -left-4 text-5xl text-primary/20 font-serif">"</div>
              <div className="flex items-center mb-6">
                <div className="relative">
                  <img src="https://i.pravatar.cc/60?u=alex" alt="Alex R." className="w-12 h-12 rounded-full border-2 border-base-content/10"/>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-base-100"></div>
                </div>
                <div className="ml-4">
                  <p className="font-bold text-base-content font-mono">Alex R.</p>
                  <p className="text-sm text-base-content/60 font-mono">Content Strategist</p>
                </div>
              </div>
              <p className="text-base-content/80 italic mb-4 font-mono leading-relaxed">"This editor is a game-changer. My writing is clearer, faster, and just... better. The AI suggestions are surprisingly spot-on."</p>
              {/* Simple star rating */}
              <div className="flex text-warning">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="p-6 border border-base-content/10 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-300 bg-base-200 relative md:translate-y-8">
              {/* Decorative quote mark */}
              <div className="absolute -top-4 -left-4 text-5xl text-primary/20 font-serif">"</div>
              <div className="flex items-center mb-6">
                <div className="relative">
                  <img src="https://i.pravatar.cc/60?u=jamie" alt="Jamie L." className="w-12 h-12 rounded-full border-2 border-base-content/10"/>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-base-100"></div>
                </div>
                <div className="ml-4">
                  <p className="font-bold text-base-content font-mono">Jamie L.</p>
                  <p className="text-sm text-base-content/60 font-mono">Freelance Writer</p>
                </div>
              </div>
              <p className="text-base-content/80 italic mb-4 font-mono leading-relaxed">"I cancelled my Grammarly and AI subscriptions. This tool does it all, and the interface is clean and intuitive. Highly recommend!"</p>
              {/* Simple star rating */}
              <div className="flex text-warning">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="p-6 border border-base-content/10 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-300 bg-base-200 relative">
              {/* Decorative quote mark */}
              <div className="absolute -top-4 -left-4 text-5xl text-primary/20 font-serif">"</div>
              <div className="flex items-center mb-6">
                <div className="relative">
                  <img src="https://i.pravatar.cc/60?u=morgan" alt="Morgan S." className="w-12 h-12 rounded-full border-2 border-base-content/10"/>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-base-100"></div>
                </div>
                <div className="ml-4">
                  <p className="font-bold text-base-content font-mono">Morgan S.</p>
                  <p className="text-sm text-base-content/60 font-mono">Blogger & Entrepreneur</p>
                </div>
              </div>
              <p className="text-base-content/80 italic mb-4 font-mono leading-relaxed">"Finally, an affordable tool that doesn't skimp on features. The yearly plan is a steal. My workflow has never been smoother."</p>
              {/* Simple star rating */}
              <div className="flex text-warning">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-base-300">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-base-100 rounded-xl shadow-md border border-base-content/10 mb-6">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
              <span className="font-mono text-sm tracking-widest">FAQ</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-base-content font-mono">Frequently Asked Questions</h2>
            <p className="text-center text-lg text-base-content/70 mb-8 max-w-2xl mx-auto">Everything you need to know about our smart writing editor</p>
          </div>
          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <div className="collapse collapse-plus bg-base-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-xl border border-base-content/10">
              <input type="checkbox" className="peer" defaultChecked /> 
              <div className="collapse-title font-bold text-lg font-mono">
                Is there a free trial?
              </div>
              <div className="collapse-content">
                <p className="text-base-content/70 font-mono">We don't offer a free trial currently, but our $5 monthly plan lets you experience the full power of the editor with minimal commitment. Plus, we have a 14-day money-back guarantee.</p>
              </div>
            </div>
            {/* FAQ Item 2 */}
            <div className="collapse collapse-plus bg-base-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-xl border border-base-content/10">
              <input type="checkbox" className="peer" /> 
              <div className="collapse-title font-bold text-lg font-mono">
                What AI model do you use?
              </div>
              <div className="collapse-content">
                <p className="text-base-content/70 font-mono">We leverage state-of-the-art AI models, continuously updated to provide the most relevant and helpful writing suggestions, generation, and analysis.</p>
              </div>
            </div>
            {/* FAQ Item 3 */}
            <div className="collapse collapse-plus bg-base-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-xl border border-base-content/10">
              <input type="checkbox" className="peer" /> 
              <div className="collapse-title font-bold text-lg font-mono">
                Can I use this for professional work?
              </div>
              <div className="collapse-content">
                <p className="text-base-content/70 font-mono">Absolutely! Many professionals, including marketers, writers, students, and business owners, rely on our editor to produce high-quality, error-free content efficiently.</p>
              </div>
            </div>
            {/* FAQ Item 4 */}
            <div className="collapse collapse-plus bg-base-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-xl border border-base-content/10">
              <input type="checkbox" className="peer" /> 
              <div className="collapse-title font-bold text-lg font-mono">
                How secure is my data?
              </div>
              <div className="collapse-content">
                <p className="text-base-content/70 font-mono">Security is our top priority. All your writing is encrypted both in transit and at rest. We adhere to strict privacy policies and never sell or share your data.</p>
              </div>
            </div>
            {/* FAQ Item 5 */}
            <div className="collapse collapse-plus bg-base-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-xl border border-base-content/10">
              <input type="checkbox" className="peer" /> 
              <div className="collapse-title font-bold text-lg font-mono">
                Can I cancel or switch plans?
              </div>
              <div className="collapse-content">
                <p className="text-base-content/70 font-mono">Yes, you have full control. You can easily switch between monthly and yearly plans or cancel your subscription anytime directly from your account settings.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

       {/* Final CTA Section */}
      <section className="py-20 bg-primary text-primary-content relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] bg-[length:20px_20px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-base-100/20 rounded-xl shadow-md border border-primary-content/10 mb-6">
            <div className="w-2 h-2 rounded-full bg-base-100 animate-pulse"></div>
            <span className="font-mono text-sm tracking-widest">GET STARTED</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-mono">Ready to Elevate Your Writing?</h2>
          <p className="text-lg md:text-xl mb-8 text-primary-content/90 max-w-xl mx-auto">
            Join thousands of writers streamlining their process and producing better content.
          </p>
          <div className="max-w-md mx-auto">
            <ButtonCheckout
              priceId={yearlyPriceId} // Encourage yearly signup
              mode="subscription"
              className="btn bg-base-100 hover:bg-base-200 text-base-content border-none font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 w-full py-4 text-xl"
            >
              Get Started Today - $50/yr
            </ButtonCheckout>
            <p className="mt-4 text-primary-content/80 text-sm font-mono">
              Or <ButtonCheckout 
                priceId={monthlyPriceId} 
                mode="subscription" 
                asLink={true} 
                className="font-bold underline hover:text-primary-content transition"
              >
                start monthly for $5
              </ButtonCheckout>.
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-secondary/30 blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 rounded-full bg-accent/30 blur-xl"></div>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-10 bg-base-300 text-base-content/70 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#00000010_1px,transparent_1px)] bg-[length:20px_20px] opacity-30"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-left mb-6 md:mb-0">
              <div className="font-bold text-xl mb-2 font-mono">CreatiFun Editor</div>
              <p className="text-sm max-w-md font-mono">The smart writing tool that helps you create better content faster.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm text-left">
              <Link href="/privacy-policy" className="hover:text-primary transition-colors duration-200 font-mono flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Privacy Policy
              </Link>
              <Link href="/tos" className="hover:text-primary transition-colors duration-200 font-mono flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Terms of Service
              </Link>
              <Link href="/dashboard" className="hover:text-primary transition-colors duration-200 font-mono flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link href="/feature-requests" className="hover:text-primary transition-colors duration-200 font-mono flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Feature Requests
              </Link>
            </div>
          </div>
          
          <div className="border-t border-base-content/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="mb-4 md:mb-0 font-mono text-sm">© {new Date().getFullYear()} CreatiFun Editor. All rights reserved.</p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full bg-base-100 hover:bg-primary hover:text-primary-content transition-colors duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="p-2 rounded-full bg-base-100 hover:bg-primary hover:text-primary-content transition-colors duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
