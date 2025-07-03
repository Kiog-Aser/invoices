import config from "@/config";

export default function Hero() {
  return (
    <section className="bg-gray-50 py-20 px-4 relative overflow-hidden">
      {/* Circus-style radial lines background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-4xl">
          {/* Radial lines emanating from center */}
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 origin-bottom"
              style={{
                height: '120vh',
                width: '2px',
                transform: `translate(-50%, -100%) rotate(${i * 15}deg)`,
                background: i % 2 === 0 
                  ? 'linear-gradient(to top, rgba(34, 197, 94, 0.1), transparent 60%)' 
                  : 'linear-gradient(to top, rgba(255, 255, 255, 0.3), transparent 60%)'
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Stripe branding */}
        <div className="flex justify-center mb-6">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            Made for 
            <span className="font-semibold text-blue-600">stripe</span>
          </div>
        </div>

        {/* Main headline - smaller text */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Stop paying <span className="text-red-500">0.4%</span><br />
          for Stripe invoices
        </h1>

        {/* Subtitle - smaller text */}
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Let your customers generate, edit, and download<br />
          their invoices, with just a <span className="underline decoration-green-500 decoration-2">link</span>.
        </p>

        {/* Feature checkmarks - centered vertically */}
        <div className="flex flex-col justify-center items-center gap-3 mb-10">
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>1-minute no-code setup</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Editable invoices (VAT, etc.)</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>No 0.4% Stripe invoice fee</span>
          </div>
        </div>

        {/* CTA Button - improved styling and text */}
        <div className="mb-16">
          <a
            href={config.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-10 py-4 rounded-2xl text-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-block"
          >
            Get Zenvoice ➜
          </a>
        </div>

        {/* Reviews section */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-2">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white font-semibold text-sm">A</div>
              <div className="w-10 h-10 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white font-semibold text-sm">B</div>
              <div className="w-10 h-10 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white font-semibold text-sm">C</div>
              <div className="w-10 h-10 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center text-white font-semibold text-sm">D</div>
              <div className="w-10 h-10 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white font-semibold text-sm">E</div>
            </div>
            <div className="flex text-yellow-400 ml-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 font-medium">
            <span className="font-bold">1432</span> founders sleep better
          </p>
        </div>
      </div>
    </section>
  );
}
