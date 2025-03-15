import { getSession, signIn } from "next-auth/react";

export async function refreshUserSession() {
  try {
    // Fetch the latest user data with plan information
    const response = await fetch('/api/auth/session?update=true');
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Get current session
    const session = await getSession();
    
    // Check if we need to update the session (if plan has changed)
    if (session?.user?.plan !== data.user?.plan) {
      console.log('Plan changed, updating session...');
      
      // Force session refresh
      await signIn('credentials', { 
        redirect: false,
        email: data.user.email,
        callbackUrl: window.location.href
      });
    }
    
    return data.user;
  } catch (error) {
    console.error('Error refreshing session:', error);
    throw error;
  }
}

// Function to handle Stripe success
export function setupStripeSuccessListener() {
  // Remove any existing success parameter from URL
  const url = new URL(window.location.href);
  const success = url.searchParams.get('success');
  
  if (success === 'true') {
    url.searchParams.delete('success');
    window.history.replaceState({}, document.title, url.toString());
    
    // Wait a moment for webhook to process
    setTimeout(async () => {
      try {
        // Try to refresh session a few times to ensure webhook has processed
        let attempts = 0;
        const maxAttempts = 3;
        
        const tryRefresh = async () => {
          const userData = await refreshUserSession();
          console.log('Refreshed user data:', userData);
          
          if (userData?.plan === 'pro') {
            return true;
          }
          
          if (attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000));
            return tryRefresh();
          }
          
          return false;
        };
        
        const success = await tryRefresh();
        if (!success) {
          console.warn('Failed to confirm pro status after multiple attempts');
        }
      } catch (error) {
        console.error('Error handling Stripe success:', error);
      }
    }, 2000);
  }
}