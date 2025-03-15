'use client';

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ActivationSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">🎉 Activation Successful!</h1>
          <p className="text-base-content/60">
            {email ? `Your account (${email}) has been successfully activated.` : 'Your account has been successfully activated.'}
          </p>
        </div>
        
        <div>
          <Link 
            href="/auth/signin" 
            className="btn btn-primary"
          >
            Sign In
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
      <ActivationSuccessContent />
    </Suspense>
  );
}