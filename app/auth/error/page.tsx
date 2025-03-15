'use client';

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Authentication Error</h1>
          <p className="text-base-content/60">
            {error === "AccessDenied" 
              ? "You do not have permission to sign in."
              : error || "An error occurred during authentication."
            }
          </p>
        </div>
        
        <div>
          <Link 
            href="/auth/signin" 
            className="btn btn-primary"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}