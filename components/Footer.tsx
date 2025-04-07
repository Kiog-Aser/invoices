import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/icon.png";

// Add the Footer to the bottom of your landing page and more.
// The support link is connected to the config.js file. If there's no config.mailgun.supportEmail, the link won't be displayed.

const Footer = () => {
  return (
    <footer className="bg-base-300 border-t border-base-content/10 relative overflow-hidden">
      {/* Retro grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-[length:20px_20px] opacity-25"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-40 w-40 h-40 bg-primary/5 rounded-full blur-xl"></div>
      <div className="absolute bottom-40 left-20 w-60 h-60 bg-secondary/5 rounded-full blur-xl"></div>
      
      <div className="max-w-7xl mx-auto px-8 py-24 relative">
        <div className="flex lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col gap-10">
          <div className="w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left">
            <Link
              href="/#"
              aria-current="page"
              className="flex gap-2 justify-center md:justify-start items-center bg-base-100 px-3 py-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 inline-block"
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                priority={true}
                className="w-6 h-6"
                width={24}
                height={24}
              />
              <strong className="font-mono font-bold tracking-tight text-base md:text-lg">
                {config.appName}
              </strong>
            </Link>

            <p className="mt-4 text-sm text-base-content/80 font-mono">
              {config.appDescription}
            </p>
            <p className="mt-3 text-sm text-base-content/60 font-mono">
              Copyright © {new Date().getFullYear()} - All rights reserved
            </p>
          </div>
          <div className="flex-grow flex flex-wrap -mb-10 md:mt-0 text-center">
            <div className="lg:w-1/3 md:w-1/2 w-full px-4 flex flex-col md:items-start items-start">
              <div className="font-mono font-bold text-base-content tracking-widest text-sm mb-3 bg-base-100 px-3 py-1 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 inline-block">
                LINKS
              </div>

              <div className="flex flex-col md:items-start items-start gap-3 mb-10 text-sm mt-4">
                <Link href="/testimonial/new" target="_blank" className="font-mono text-base-content hover:text-primary transition-colors">
                  Leave A Testimonial
                </Link>
                <Link href="https://insigh.to/b/creatifun" target="_blank" className="font-mono text-base-content hover:text-primary transition-colors">
                  Feature Request
                </Link>
                <Link href="/#pricing" className="font-mono text-base-content hover:text-primary transition-colors">
                  Pricing
                </Link>
              </div>
            </div>

            <div className="lg:w-1/3 md:w-1/2 w-full px-4 flex flex-col md:items-start items-start">
              <div className="font-mono font-bold text-base-content tracking-widest text-sm mb-3 bg-base-100 px-3 py-1 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 inline-block">
                LEGAL
              </div>

              <div className="flex flex-col md:items-start items-start gap-3 mb-10 text-sm mt-4">
                <Link href="/tos" target="_blank" className="font-mono text-base-content hover:text-primary transition-colors">
                  Terms of services
                </Link>
                <Link href="/privacy-policy" target="_blank" className="font-mono text-base-content hover:text-primary transition-colors">
                  Privacy policy
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/3 md:w-1/2 w-full px-4 flex flex-col md:items-start items-start">
              <div className="font-mono font-bold text-base-content tracking-widest text-sm mb-3 bg-base-100 px-3 py-1 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 inline-block">
                FOLLOW ME
              </div>

              <div className="flex flex-col md:items-start items-start gap-3 mb-10 text-sm mt-4">
                <Link href="https://medium.com/@milhoornaert" target="_blank" className="font-mono text-base-content hover:text-primary transition-colors">
                  Medium
                </Link>
                <Link href="https://x.com/MilHoornaert" target="_blank" className="font-mono text-base-content hover:text-primary transition-colors">
                   𝕏
                </Link>
                <Link href="http://news.milh.tech" target="_blank" className="font-mono text-base-content hover:text-primary transition-colors">
                  Newsletter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
