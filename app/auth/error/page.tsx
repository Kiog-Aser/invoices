"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  let errorMessage = "An error occurred during authentication";
  
  // Translate error codes to user-friendly messages
  if (error === "OAuthAccountNotLinked") {
    errorMessage = "This email is already associated with another sign-in method. Please use your original sign-in method.";
  } else if (error === "AccessDenied") {
    errorMessage = "Access was denied. You may not have permission to sign in.";
  } else if (error === "Configuration") {
    errorMessage = "There is a problem with the server configuration. Please contact support.";
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center">
        <div className="rounded-lg bg-red-50 p-6">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-4 text-lg font-medium text-red-800">Authentication Error</h2>
          <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
        </div>
        <div className="mt-8">
          <Link 
            href="/auth/signin"
            className="btn btn-primary"
          >
            Try Again
          </Link>
        </div>
        <div className="mt-4">
          <Link 
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="loading loading-spinner"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}