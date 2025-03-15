"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

interface LogoutCountdownProps {
  onCancel: () => void;
}

export default function LogoutCountdown({ onCancel }: LogoutCountdownProps) {
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(timer);
          // Log user out when countdown reaches 0
          signOut({ callbackUrl: "/auth/signin?message=Please sign in again to access your Pro features" });
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    // Cleanup on unmount
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="modal-box p-6 bg-base-100 rounded-box shadow-lg max-w-md animate-slide-in">
        <h3 className="font-bold text-lg mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Session Update Required
        </h3>
        <p className="py-4">
          Your account has been upgraded to Pro! To access your new features, you need to refresh your session.
        </p>
        <p className="py-2 font-medium">
          You will be logged out in {countdown} seconds...
        </p>
        <div className="modal-action flex justify-center gap-4">
          <button 
            className="btn btn-outline"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => signOut({ callbackUrl: "/auth/signin?message=Please sign in again to access your Pro features" })}
          >
            Log out now
          </button>
        </div>
      </div>
    </div>
  );
}