const HERO_TITLE = "Skip Stripe's 0.4% Invoice Fees";
const HERO_SUBTITLE = "Create unlimited invoice access links for your customers. Let them search, edit, and download invoices for free.";
const HERO_CTA = "Start Saving Today";

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-gray-800">
          {HERO_TITLE}
        </h1>
        <p className="text-lg md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {HERO_SUBTITLE}
        </p>
        
        {/* Key Benefits */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">$0</div>
            <div className="text-sm text-gray-600">Per invoice</div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">∞</div>
            <div className="text-sm text-gray-600">Unlimited access</div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">1×</div>
            <div className="text-sm text-gray-600">One-time payment</div>
          </div>
        </div>

        <a href="#pricing" className="btn btn-success btn-lg px-8 shadow-lg">
          {HERO_CTA}
        </a>
      </div>
      
      {/* Background decorations */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute right-10 top-10 w-40 h-40 bg-green-200/30 rounded-full blur-2xl"></div>
        <div className="absolute left-10 bottom-10 w-60 h-60 bg-green-300/20 rounded-full blur-2xl"></div>
      </div>
    </section>
  );
}
