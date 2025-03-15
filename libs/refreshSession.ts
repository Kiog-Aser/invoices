import { useSession } from "next-auth/react";
import { getSession, signIn } from "next-auth/react";

export async function refreshUserSession() {
  // Check if we've already refreshed
  const hasRefreshed = sessionStorage.getItem('session_refreshed');
  if (hasRefreshed === 'true') {
    return null;
  }
  
  try {
    // Mark as refreshed early to prevent multiple simultaneous refreshes
    sessionStorage.setItem('session_refreshed', 'true');
    
    // Fetch the latest user data with plan information
    const response = await fetch('/api/user');
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const userData = await response.json();
    
    // Check if we need to update the session
    const session = await getSession();
    if (session?.user?.plan !== userData.plan) {
      console.log('Plan changed, updating session...');
      await signIn('credentials', { 
        redirect: false,
        email: userData.email,
        callbackUrl: window.location.href
      });
    }
    
    return userData;
  } catch (error) {
    console.error('Error refreshing session:', error);
    // Clear the refresh flag on error so we can try again
    sessionStorage.removeItem('session_refreshed');
    return null;
  }
}

// Add a function to handle Stripe success with retries
export function setupStripeSuccessListener() {
  // Check URL on page load for success parameter
  const url = new URL(window.location.href);
  if (url.searchParams.get('success') === 'true') {
    // Clear the success parameter to prevent reprocessing on refresh
    url.searchParams.delete('success');
    window.history.replaceState({}, document.title, url.toString());
    
    // Reset the session refresh flag
    sessionStorage.removeItem('session_refreshed');
    
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 2000; // 2 seconds between retries
    
    // Function to check user status with retries
    const checkUserStatus = async () => {
      try {
        const response = await fetch('/api/user');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        console.log('Checking user data after payment:', userData);
        
        if (userData.plan === 'pro') {
          // Successfully upgraded to pro
          console.log('Pro plan confirmed, refreshing session...');
          await refreshUserSession();
          return true;
        } else if (retryCount < maxRetries) {
          // Not pro yet, retry after delay
          retryCount++;
          console.log(`Plan not updated yet, retrying (${retryCount}/${maxRetries})...`);
          setTimeout(checkUserStatus, retryDelay);
          return false;
        } else {
          console.error('Max retries reached, plan not updated');
          return false;
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkUserStatus, retryDelay);
        }
        return false;
      }
    };
    
    // Start checking after initial delay to allow webhook processing
    setTimeout(checkUserStatus, 2000);
  }
}