"use client";

import { signIn, useSession } from "next-auth/react";
import config from "@/config";

interface ButtonSigninProps {
  text?: string;
  className?: string;
  allowAdminSignin?: boolean;
}

export default function ButtonSignin({ 
  text = "Sign in", 
  className = "",
  allowAdminSignin = false 
}: ButtonSigninProps) {
  const { data: session } = useSession();
  
  // If this is an admin user or we specifically allow admin signin, show the signin button
  if (allowAdminSignin || session?.user?.isAdmin) {
    return (
      <button
        className={`btn btn-primary font-mono ${className}`}
        onClick={() => signIn()}
      >
        {text}
      </button>
    );
  }

  // For non-admin users or public access, redirect to GitHub repo
  return (
    <a
      href={config.githubRepo}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-primary font-mono ${className}`}
    >
      {text}
    </a>
  );
}
