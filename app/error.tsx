"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // If the error is auth-related, redirect to login
    if (error?.message?.toLowerCase().includes('unauthorized') || 
        error?.message?.toLowerCase().includes('unauthenticated')) {
      router.push('/auth/signin');
    }
  }, [error, router]);

  return (
    <>
      <div className="h-screen w-full flex flex-col justify-center items-center text-center gap-6 p-6">
        <div className="p-6 bg-white rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 mx-auto text-primary"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        <p className="font-medium md:text-xl md:font-semibold">
          Something went wrong 🥲
        </p>

        <p className="text-red-500">{error?.message}</p>

        <div className="flex flex-wrap gap-4 justify-center">
          <button className="btn btn-sm" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="btn btn-sm">
            Go Home
          </Link>
        </div>
      </div>
    </>
  );
}
