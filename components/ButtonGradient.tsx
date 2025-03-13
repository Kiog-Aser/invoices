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
    <button {...props} className={classes}>
      {children}
    </button>
  );
}
