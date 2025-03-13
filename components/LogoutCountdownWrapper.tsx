"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LogoutCountdown from "./LogoutCountdown";

export default function LogoutCountdownWrapper() {
  const [showLogoutCountdown, setShowLogoutCountdown] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      // Remove the success parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      window.history.replaceState({}, document.title, url.toString());
      
      // Show the logout countdown
      setShowLogoutCountdown(true);
    }
  }, [searchParams]);

  return (
    <>
      {showLogoutCountdown && (
        <LogoutCountdown 
          onCancel={() => setShowLogoutCountdown(false)}
        />
      )}
    </>
  );
}