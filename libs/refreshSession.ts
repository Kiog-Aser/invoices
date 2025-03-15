import { useSession } from "next-auth/react";
import { getSession, signIn } from "next-auth/react";

export async function refreshUserSession() {
  // Check if we've already refreshed
  const hasRefreshed = sessionStorage.getItem('session_refreshed');
  if (hasRefreshed === 'true') {
    return null;
  }
  
  try {
    // Fetch the latest user data with plan information
    const response = await fetch('/api/user');
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const userData = await response.json();
    
    // Mark as refreshed
    sessionStorage.setItem('session_refreshed', 'true');
    
    // Check if we need to update the session (if plan has changed)
    const session = await getSession();
    if (session?.user?.plan !== userData.plan) {
      console.log('Plan changed, updating session...');
      
      // Use signIn method to force session refresh
      await signIn('credentials', { 
        redirect: false,
        email: userData.email,
        callbackUrl: window.location.href
      });
    }
    
    return userData;
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
    
    // Wait a moment for the webhook to process
    setTimeout(async () => {
      try {
        // Explicitly fetch user data to get updated plan
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          console.log('Updated user data after payment:', userData);
          
          // If the user has been upgraded to pro, reload the page
          if (userData.plan === 'pro') {
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    }, 2000);
  }
}