const HERO_TITLE = "Launch your SaaS in days, not months";
const HERO_SUBTITLE = "A modern boilerplate for SaaS founders. Auth, payments, dashboard, and more—ready out of the box.";
const HERO_CTA = "Get Started Free";

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center bg-gradient-to-b from-base-100 to-base-200">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 font-mono text-base-content">
          {HERO_TITLE}
        </h1>
        <p className="text-lg md:text-2xl text-base-content/70 mb-8 font-mono">
          {HERO_SUBTITLE}
        </p>
        <a href="#pricing" className="btn btn-primary btn-lg px-8 font-mono shadow-md">
          {HERO_CTA}
        </a>
      </div>
      <div className="absolute -z-10 top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute right-10 top-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl"></div>
        <div className="absolute left-10 bottom-10 w-60 h-60 bg-secondary/10 rounded-full blur-2xl"></div>
      </div>
    </section>
  );
}
