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

const Header = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header className="bg-white border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src={logo} 
                alt="InvoiceLink" 
                width={32} 
                height={32} 
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900">InvoiceLink</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex">
            <ButtonSignin 
              text="Login"
              className="text-gray-600 hover:text-gray-900 font-medium bg-transparent border-0 shadow-none hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
              allowAdminSignin={true}
            />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition duration-150 ease-in-out"
              onClick={() => setIsOpen(true)}
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="fixed inset-0 z-50 bg-white">
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <Link href="/" className="flex items-center gap-3">
                  <Image 
                    src={logo} 
                    alt="InvoiceLink" 
                    width={32} 
                    height={32} 
                    className="rounded-lg"
                  />
                  <span className="text-xl font-bold text-gray-900">InvoiceLink</span>
                </Link>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setIsOpen(false)}
                >
                  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-4 py-6 space-y-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-gray-600 hover:text-gray-900 font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-200">
                  <ButtonSignin 
                    text="Login"
                    className="w-full text-left text-gray-600 hover:text-gray-900 font-medium bg-transparent border-0 shadow-none hover:bg-gray-50 px-0 py-2"
                    allowAdminSignin={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
