import { getSession, signIn } from "next-auth/react";

export async function refreshUserSession() {
  try {
    const response = await fetch('/api/refresh-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to refresh session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error refreshing session:', error);
    throw error;
  }
}

export async function setupStripeSuccessListener() {
  try {
    // Attempt to refresh session immediately after Stripe success
    await refreshUserSession();
    
    // Then set up polling to keep checking until the plan is updated
    let attempts = 0;
    const maxAttempts = 5;
    const pollInterval = 2000; // 2 seconds

    const pollForUpdate = async () => {
      if (attempts >= maxAttempts) return;

      try {
        const userData = await refreshUserSession();
        if (userData?.plan === 'pro') {
          // Plan is updated, stop polling
          return;
        }

        // Plan not updated yet, try again
        attempts++;
        setTimeout(pollForUpdate, pollInterval);
      } catch (error) {
        console.error('Error polling for plan update:', error);
        attempts++;
        setTimeout(pollForUpdate, pollInterval);
      }
    };

    // Start polling
    pollForUpdate();
  } catch (error) {
    console.error('Error setting up success listener:', error);
  }
}