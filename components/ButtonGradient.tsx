"use client";

import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonGradientProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  children: ReactNode;
}

export default function ButtonGradient({
  href,
  children,
  className = "",
  type,
  onClick,
  disabled,
  ...props
}: ButtonGradientProps) {
  const classes = `btn btn-gradient ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 text-base font-medium text-white bg-gradient-to-r from-primary to-primary-focus hover:from-primary-focus hover:to-primary transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
