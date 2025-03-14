import { useSession } from "next-auth/react";
import { getSession, signIn } from "next-auth/react";

// Add retries and timeout handling
export async function refreshUserSession(retries = 3, timeout = 10000) {
  // Check if we've already refreshed
  const hasRefreshed = sessionStorage.getItem('session_refreshed');
  if (hasRefreshed === 'true') {
    return null;
  }
  
  let currentTry = 0;
  
  while (currentTry < retries) {
    try {
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Fetch the latest user data
      const response = await fetch('/api/refresh-session', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Failed to refresh session');
      }
      
      const userData = await response.json();
      
      // Mark as refreshed
      sessionStorage.setItem('session_refreshed', 'true');
      
      // Use signIn method to force session refresh with timeout
      await Promise.race([
        signIn('credentials', {
          redirect: false,
          email: userData.user.email,
          callbackUrl: window.location.href
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Sign in timeout')), timeout)
        )
      ]);
      
      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      currentTry++;
      
      // If it's a timeout error, wait before retrying
      if (error.name === 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // If we've exhausted all retries, return null
      if (currentTry === retries) {
        return null;
      }
    }
  }
  
  return null;
}

// Add a function to handle Stripe success with timeout
export function setupStripeSuccessListener(timeout = 10000) {
  const url = new URL(window.location.href);
  if (url.searchParams.get('success') === 'true') {
    url.searchParams.delete('success');
    window.history.replaceState({}, document.title, url.toString());
    
    // Reset the session refresh flag to force a refresh
    sessionStorage.removeItem('session_refreshed');
    
    // Add timeout to page reload
    setTimeout(() => {
      window.location.reload();
    }, 500); // Small delay to ensure state is updated
  }
}