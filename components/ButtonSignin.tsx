"use client";

import { signIn } from "next-auth/react";

interface ButtonSigninProps {
  text?: string;
  className?: string;
}

export default function ButtonSignin({ text = "Sign in", className = "" }: ButtonSigninProps) {
  return (
    <button
      className={`btn btn-primary ${className}`}
      onClick={() => signIn()}
    >
      {text}
    </button>
  );
}
