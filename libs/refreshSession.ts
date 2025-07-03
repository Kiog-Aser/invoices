import { useSession } from "next-auth/react";
import { getSession } from "next-auth/react";

export async function refreshUserSession() {
  try {
    // Fetch the latest user data with plan information
    const response = await fetch('/api/user');
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const userData = await response.json();
    console.log('Refreshed user data:', userData);
    
    // Force a revalidation of the session
    await fetch('/api/auth/session?update=true');
    
    return userData;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
}

export function setupStripeSuccessListener() {
  // Check URL on page load for success parameter
  const url = new URL(window.location.href);
  if (url.searchParams.get('success') === 'true') {
    // Clear the success parameter to prevent reprocessing on refresh
    url.searchParams.delete('success');
    window.history.replaceState({}, document.title, url.toString());
    
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
          // Successfully upgraded to pro, refresh the session
          console.log('Pro plan confirmed, refreshing session...');
          await refreshUserSession();
          window.location.reload(); // Refresh to update UI
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