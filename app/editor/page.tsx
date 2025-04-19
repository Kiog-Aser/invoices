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
    <main className="min-h-screen bg-gray-50 text-gray-800 font-sans antialiased">
      <HeaderLanding />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div> {/* Subtle overlay */}
        <div className="container mx-auto px-6 py-24 md:py-32 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Write Smarter, Not Harder.
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-xl mx-auto lg:mx-0">
              Stop juggling multiple writing tools. Get AI-powered suggestions, advanced grammar checks, and readability analysis—all in one seamless editor.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              {/* Use ButtonCheckout for direct purchase */}
              <ButtonCheckout
                priceId={monthlyPriceId}
                mode="subscription"
                className="btn btn-primary btn-lg px-8 py-3 text-lg font-semibold shadow-lg transform hover:scale-105 transition duration-300"
              >
                Start Writing - $5/mo
              </ButtonCheckout>
               <ButtonCheckout
                priceId={yearlyPriceId}
                mode="subscription"
                className="btn btn-outline btn-lg px-8 py-3 text-lg font-semibold text-white border-white hover:bg-white hover:text-indigo-600 transition duration-300"
              >
                Go Yearly & Save - $50/yr
              </ButtonCheckout>
            </div>
            <p className="mt-4 text-sm opacity-80">Cancel anytime. 14-day money-back guarantee.</p>
          </div>
          <div className="lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
            {/* Consider a more dynamic or product-focused image/video */}
            <img src="/editor-illustration.svg" alt="AI Writing Editor Illustration" className="w-full max-w-lg rounded-lg shadow-2xl"/>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">One Editor, Infinite Possibilities</h2>
          <p className="text-center text-lg text-gray-600 mb-16 max-w-2xl mx-auto">Consolidate your writing stack and unlock peak productivity with features designed for modern writers.</p>
          <div className="grid gap-10 md:gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <FeatureIcon d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.037-.502.068-.75.097h-.034l-.178.033A18.154 18.154 0 005.25 6.417M9.75 3.104C11.227 3.512 12.75 4.33 14.25 5.456M14.25 19.896c.251-.037.502-.068.75-.097h.034l.178-.034c1.286-.247 2.509-.72 3.634-1.372M14.25 19.896c-1.473.408-2.998.68-4.5.896M5 14.5c-.251.037-.502.068-.75.097h-.034l-.178.034A18.154 18.154 0 019.75 17.583M5 14.5c1.473-.408 2.998-.68 4.5-.896m0 0c1.502-.216 2.975-.52 4.373-.98M9.75 17.583c1.473.408 2.998.68 4.5.896m4.5-3.083c1.125-.652 2.347-1.125 3.634-1.372m0 0c.251-.037.502-.068.75-.097h.034l.178-.034c1.286-.247 2.509-.72 3.634-1.372" /> {/* Placeholder: Wand Icon */}
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Intelligent AI Assistance</h3>
              <p className="text-gray-600">Generate ideas, draft content, rewrite sentences, and overcome writer's block instantly.</p>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <FeatureIcon d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /> {/* Placeholder: Check Badge Icon */}
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Advanced Proofreading</h3>
              <p className="text-gray-600">Catch complex grammar errors, spelling mistakes, and punctuation issues with precision.</p>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
               <FeatureIcon d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /> {/* Placeholder: Chart Bar Icon */}
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Readability Analysis</h3>
              <p className="text-gray-600">Improve clarity, conciseness, and engagement with real-time feedback based on proven metrics.</p>
            </div>
             {/* Feature 4 */}
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <FeatureIcon d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /> {/* Placeholder: Lock Closed Icon */}
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Secure & Private</h3>
              <p className="text-gray-600">Your writing is yours. We use top-tier encryption and never sell your data.</p>
            </div>
             {/* Feature 5 */}
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <FeatureIcon d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 012.25 4.5h.75m0 0H21m-9.75 0h9.75M3 12h18M3 12a1.5 1.5 0 01-1.5-1.5v-3A1.5 1.5 0 013 6h1.5m13.5 6a1.5 1.5 0 011.5-1.5v-3a1.5 1.5 0 01-1.5-1.5h-1.5m-6 0v6" /> {/* Placeholder: Currency Dollar Icon */}
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Incredible Value</h3>
              <p className="text-gray-600">Replace multiple subscriptions with one affordable plan. Simple, transparent pricing.</p>
            </div>
             {/* Feature 6 */}
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <FeatureIcon d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /> {/* Placeholder: Clock Icon */}
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Streamlined Workflow</h3>
              <p className="text-gray-600">Focus on your writing, not on switching tabs. Everything you need, right where you need it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-b from-gray-100 to-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Simple, Powerful Pricing</h2>
          <p className="text-center text-lg text-gray-600 mb-12 max-w-xl mx-auto">Choose the plan that works best for you. Cancel or switch anytime.</p>
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col flex-1 border border-gray-200">
              <h3 className="text-2xl font-semibold mb-2 text-gray-800">Monthly</h3>
              <p className="text-gray-500 mb-6">Perfect for trying things out.</p>
              <p className="text-5xl font-extrabold mb-4 text-gray-900">$5<span className="text-xl font-medium text-gray-500">/mo</span></p>
              <ul className="mb-8 space-y-3 text-left text-gray-700 flex-grow">
                <li className="flex items-center"><CheckIcon /> Unlimited AI Assistance</li>
                <li className="flex items-center"><CheckIcon /> Advanced Grammar & Spelling</li>
                <li className="flex items-center"><CheckIcon /> Readability Analysis</li>
                <li className="flex items-center"><CheckIcon /> Secure Cloud Sync</li>
                <li className="flex items-center"><CheckIcon /> Priority Support</li>
              </ul>
              <ButtonCheckout
                priceId={monthlyPriceId}
                mode="subscription"
                className="btn btn-outline btn-primary w-full mt-auto py-3 text-lg font-semibold"
              >
                Get Started Monthly
              </ButtonCheckout>
            </div>
            {/* Yearly Plan - Highlighted */}
            <div className="bg-indigo-600 text-white p-8 rounded-xl shadow-2xl flex flex-col flex-1 relative ring-4 ring-indigo-300 ring-offset-2 ring-offset-white">
               <span className="absolute top-0 right-0 bg-yellow-400 text-indigo-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg transform translate-x-2 -translate-y-2">Best Value</span>
              <h3 className="text-2xl font-semibold mb-2">Yearly</h3>
              <p className="text-indigo-200 mb-6">Save 16% and focus on writing.</p>
              <p className="text-5xl font-extrabold mb-4">$50<span className="text-xl font-medium text-indigo-200">/yr</span></p>
               <ul className="mb-8 space-y-3 text-left text-indigo-100 flex-grow">
                <li className="flex items-center"><CheckIcon /> Everything in Monthly</li>
                <li className="flex items-center"><CheckIcon /> <span className="font-semibold">Save $10 per year</span></li>
                <li className="flex items-center"><CheckIcon /> Early access to new features</li>
              </ul>
              <ButtonCheckout
                priceId={yearlyPriceId}
                mode="subscription"
                className="btn btn-light w-full mt-auto py-3 text-lg font-semibold text-indigo-700 hover:bg-gray-100"
              >
                Go Yearly & Save
              </ButtonCheckout>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">Loved by Writers Like You</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
              {/* Add avatar placeholder */}
              <img src="https://i.pravatar.cc/60?u=alex" alt="Alex R." className="w-12 h-12 rounded-full mb-4 mx-auto md:mx-0"/>
              <p className="text-gray-700 italic mb-4">"This editor is a game-changer. My writing is clearer, faster, and just... better. The AI suggestions are surprisingly spot-on."</p>
              <p className="font-semibold text-gray-900">— Alex R.</p>
              <p className="text-sm text-gray-500">Content Strategist</p>
            </div>
            {/* Testimonial 2 */}
            <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
               <img src="https://i.pravatar.cc/60?u=jamie" alt="Jamie L." className="w-12 h-12 rounded-full mb-4 mx-auto md:mx-0"/>
              <p className="text-gray-700 italic mb-4">"I cancelled my Grammarly and AI subscriptions. This tool does it all, and the interface is clean and intuitive. Highly recommend!"</p>
              <p className="font-semibold text-gray-900">— Jamie L.</p>
               <p className="text-sm text-gray-500">Freelance Writer</p>
            </div>
            {/* Testimonial 3 */}
            <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
               <img src="https://i.pravatar.cc/60?u=morgan" alt="Morgan S." className="w-12 h-12 rounded-full mb-4 mx-auto md:mx-0"/>
              <p className="text-gray-700 italic mb-4">"Finally, an affordable tool that doesn't skimp on features. The yearly plan is a steal. My workflow has never been smoother."</p>
              <p className="font-semibold text-gray-900">— Morgan S.</p>
               <p className="text-sm text-gray-500">Blogger & Entrepreneur</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Consider making this an accordion */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-8">
            {/* FAQ Item 1 */}
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Is there a free trial?</h3>
              <p className="text-gray-700">We don't offer a free trial currently, but our $5 monthly plan lets you experience the full power of the editor with minimal commitment. Plus, we have a 14-day money-back guarantee.</p>
            </div>
            {/* FAQ Item 2 */}
             <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">What AI model do you use?</h3>
              <p className="text-gray-700">We leverage state-of-the-art AI models, continuously updated to provide the most relevant and helpful writing suggestions, generation, and analysis.</p>
            </div>
            {/* FAQ Item 3 */}
             <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Can I use this for professional work?</h3>
              <p className="text-gray-700">Absolutely! Many professionals, including marketers, writers, students, and business owners, rely on our editor to produce high-quality, error-free content efficiently.</p>
            </div>
            {/* FAQ Item 4 */}
             <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">How secure is my data?</h3>
              <p className="text-gray-700">Security is our top priority. All your writing is encrypted both in transit and at rest. We adhere to strict privacy policies and never sell or share your data.</p>
            </div>
             {/* FAQ Item 5 */}
             <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Can I cancel or switch plans?</h3>
              <p className="text-gray-700">Yes, you have full control. You can easily switch between monthly and yearly plans or cancel your subscription anytime directly from your account settings.</p>
            </div>
          </div>
        </div>
      </section>

       {/* Final CTA Section */}
      <section className="py-20 bg-indigo-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Elevate Your Writing?</h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-xl mx-auto">Join thousands of writers streamlining their process and producing better content.</p>
          <ButtonCheckout
            priceId={yearlyPriceId} // Encourage yearly signup
            mode="subscription"
            className="btn btn-light btn-lg px-10 py-4 text-xl font-semibold text-indigo-700 hover:bg-gray-100 shadow-lg transform hover:scale-105 transition duration-300"
          >
            Get Started Today - $50/yr
          </ButtonCheckout>
           <p className="mt-4 text-indigo-200 text-sm">Or <ButtonCheckout priceId={monthlyPriceId} mode="subscription" asLink={true} className="font-semibold underline hover:text-white transition">start monthly for $5</ButtonCheckout>.</p>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-10 bg-gray-800 text-gray-400 text-center">
        <div className="container mx-auto px-6">
          <div className="flex justify-center space-x-6 mb-4">
             <Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
             <Link href="/tos" className="hover:text-white transition">Terms of Service</Link>
             {/* Add other relevant links */}
          </div>
          <p>© {new Date().getFullYear()} CreatiFun Editor. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
