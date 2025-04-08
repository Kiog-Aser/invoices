"use client";

import { useState, useEffect } from "react";
import type { JSX } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ButtonSignin from "./ButtonSignin";
import logo from "@/app/icon.png";
import config from "@/config";

const links: {
  href: string;
  label: string;
}[] = [
  {
    href: "/#pricing",
    label: "Pricing",
  },
  {
    href: "/#faq",
    label: "FAQ",
  },
];

const cta: JSX.Element = <ButtonSignin className="shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 font-mono" text="Get Started"/>;

// A header with a logo on the left, links in the center (like Pricing, etc...), and a CTA (like Get Started or Login) on the right.
// The header is responsive, and on mobile, the links are hidden behind a burger button.
const Header = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header className="bg-base-300 relative pb-0">
      {/* Retro grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-[length:20px_20px] opacity-25"></div>
      
      {/* Decorative elements - using percentage-based positioning to prevent overflow */}
      <div className="absolute -top-5 right-[5%] w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
      
      <nav
        className="container flex items-center justify-between px-8 pt-2 mx-auto relative"
        aria-label="Global"
      >
        {/* Your logo/name on large screens */}
        <div className="flex lg:flex-1">
          <Link
            className="flex items-center gap-2 shrink-0 bg-base-100 px-3 py-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10"
            href="/"
            title={`${config.appName} homepage`}
          >
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-6 h-6"
              priority={true}
              width={24}
              height={24}
            />
            <span className="font-mono font-bold text-lg">{config.appName}</span>
          </Link>
        </div>
        {/* Burger button to open menu on mobile */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="bg-base-100 p-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-base-content"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Your links on large screens */}
        <div className="hidden lg:flex lg:justify-center lg:gap-12 lg:items-center">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className="font-mono text-base-content hover:text-primary px-3 py-1 hover:bg-base-100 rounded-lg transition-colors"
              title={link.label}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA on large screens */}
        <div className="hidden lg:flex lg:justify-end lg:flex-1">{cta}</div>
      </nav>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
        <div
          className={`fixed inset-y-0 right-0 z-10 w-full px-8 py-4 overflow-y-auto bg-base-300 sm:max-w-sm shadow-[4px_0px_0px_0px_rgba(0,0,0,0.1)] transform origin-right transition ease-in-out duration-300`}
        >
          {/* Retro grid background for mobile menu */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-[length:20px_20px] opacity-25"></div>
          
          {/* Your logo/name on small screens */}
          <div className="flex items-center justify-between relative">
            <Link
              className="flex items-center gap-2 shrink-0 bg-base-100 px-3 py-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10"
              title={`${config.appName} homepage`}
              href="/"
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                className="w-6 h-6"
                priority={true}
                width={24}
                height={24}
              />
              <span className="font-mono font-bold text-lg">{config.appName}</span>
            </Link>
            <button
              type="button"
              className="bg-base-100 p-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Your links on small screens */}
          <div className="flow-root mt-6 relative">
            <div className="py-4">
              <div className="flex flex-col gap-y-4 items-start">
                {links.map((link) => (
                  <Link
                    href={link.href}
                    key={link.href}
                    className="font-mono px-3 py-2 bg-base-100 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 w-full"
                    title={link.label}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="divider"></div>
            {/* Your CTA on small screens */}
            <div className="flex flex-col">{cta}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
