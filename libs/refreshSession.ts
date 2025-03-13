import { useSession } from "next-auth/react";
import { getSession, signIn } from "next-auth/react"; // Add this import

export async function refreshUserSession() {
  // Check if we've already refreshed
  const hasRefreshed = sessionStorage.getItem('session_refreshed');
  if (hasRefreshed === 'true') {
    return null;
  }
  
  try {
    // Fetch the latest user data
    const response = await fetch('/api/refresh-session');
    if (!response.ok) {
      throw new Error('Failed to refresh session');
    }
    
    // Parse the response to get the updated user data
    const userData = await response.json();
    
    // Mark as refreshed
    sessionStorage.setItem('session_refreshed', 'true');
    
    // Use signIn method to force session refresh
    await signIn('credentials', { 
      redirect: false,
      email: userData.user.email,
      callbackUrl: window.location.href
    });
    
    return true;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
}

// Add a function to handle Stripe success
export function setupStripeSuccessListener() {
  // Check URL on page load for success parameter
  const url = new URL(window.location.href);
  if (url.searchParams.get('success') === 'true') {
    // Clear the success parameter to prevent reprocessing on refresh
    url.searchParams.delete('success');
    window.history.replaceState({}, document.title, url.toString());
    
    // Reset the session refresh flag to force a refresh
    sessionStorage.removeItem('session_refreshed');
    
    // Force a hard reload to get the updated session
    window.location.reload();
  }
}