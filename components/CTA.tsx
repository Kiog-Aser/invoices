import Image from "next/image";
import ButtonSignin from "./ButtonSignin";
import config from "@/config";

function CTA() {
  return (
    <section className="relative py-24 bg-base-200 overflow-hidden flex flex-col items-center justify-center">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:20px_20px] opacity-20 pointer-events-none" />
      <div className="absolute top-10 right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
      <div className="absolute bottom-10 left-10 w-60 h-60 bg-secondary/10 rounded-full blur-2xl" />
      <div className="relative z-10 max-w-2xl mx-auto text-center px-4">
        <h2 className="text-3xl md:text-5xl font-extrabold font-mono mb-6 text-base-content">
          Ready to launch your SaaS faster?
        </h2>
        <p className="text-lg md:text-xl text-base-content/70 mb-10 font-mono">
          {config.appName} gives you authentication, payments, and a beautiful dashboard out of the box. Focus on your product, not boilerplate.
        </p>
        <ButtonSignin className="btn btn-primary btn-lg px-8 font-mono shadow-md" text={`Get ${config.appName}`} />
      </div>
    </section>
  );
}

export default CTA;
