'use client'

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import Link from "next/link";
import ButtonCheckout from "@/components/ButtonCheckout";
import ButtonAccount from "@/components/ButtonAccount";
import { getToken } from "next-auth/jwt";
import { refreshUserSession, setupStripeSuccessListener } from "@/libs/refreshSession";
import LogoutCountdown from "@/components/LogoutCountdown";

export default function Page() {
  const { data: session, status } = useSession();
  const userPlan = session?.user?.plan;
  const isPro = userPlan === 'pro';
  const planIsLoading = status === 'loading';

  const router = useRouter();
  const searchParams = useSearchParams();

  const [newWebsite, setNewWebsite] = useState("");
  const [websites, setWebsites] = useState<any[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshingSession, setRefreshingSession] = useState(false);
  const [showLogoutCountdown, setShowLogoutCountdown] = useState(false);

  const updateSession = async () => {
    const response = await fetch('/api/auth/session?update');
    if (!response.ok) {
      throw new Error('Failed to update session');
    }
    return response.json();
  };

  // Add this helper function in the component
  const refreshUserSession = async () => {
    try {
      // Fetch updated user data from our new endpoint
      const response = await fetch('/api/auth/session?update');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update session');
      }
      
      const data = await response.json();
      
      // Force a session update by reloading the page
      // This is more reliable than trying to update the session in-place
      if (data.user?.plan === 'pro') {
        console.log("Pro plan confirmed, refreshing page to update session");
        window.location.reload();
      } else {
        // If the plan isn't pro yet, wait a few seconds and try again
        // This handles the case where the webhook hasn't processed yet
        console.log("Plan not updated yet, retrying in 3 seconds...");
        return new Promise<void>((resolve) => {
          setTimeout(async () => {
            const retryResponse = await fetch('/api/auth/session?update');
            const retryData = await retryResponse.json();
            if (retryData.user?.plan === 'pro') {
              window.location.reload();
            } else {
              // If it still doesn't work, we'll let the user know they may need to refresh
              console.log("Plan still not updated after retry");
            }
            resolve();
          }, 3000);
        });
      }
    } catch (error) {
      console.error("Failed to refresh user session:", error);
      throw error;
    }
  };

  // Check for success parameter in URL - this happens after Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      // Remove the success parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      window.history.replaceState({}, document.title, url.toString());
      
      // Show logout countdown instead of refreshing session
      setShowLogoutCountdown(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const websitesResponse = await fetch('/api/websites');
        if (!websitesResponse.ok) {
          throw new Error('Failed to fetch websites');
        }
        const websitesData = await websitesResponse.json();
        setWebsites(websitesData);
        setShowOnboarding(websitesData.length === 0);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setIsLoading(false);
      }
    };
    
    if (!planIsLoading) {
      fetchData();
    }
  }, [planIsLoading]);

  const handleAddWebsite = async () => {
    if (!newWebsite) {
      toast.error("Please enter a domain name");
      return;
    }
    
    if (userPlan === "" && websites.length >= 1) {
      toast.error("Free plan limited to 1 website. Please upgrade to Pro.");
      router.push("/pricing");
      return;
    }
    
    let domain = newWebsite.trim().toLowerCase();
    if (!domain.match(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/)) {
      toast.error("Please enter a valid domain");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add website');
      }
      const newSite = await response.json();
      setWebsites([...websites, newSite]);
      setNewWebsite('');
      setShowOnboarding(false);
      toast.success('Website added successfully');
    } catch (error) {
      console.error('Error adding website:', error);
      toast.error(error.message || 'Failed to add website');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWebsiteClick = (websiteId: string) => {
    router.push(`/dashboard/notifications/${websiteId}`);
  };

  const isPageLoading = isLoading || planIsLoading || refreshingSession;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setupStripeSuccessListener();
    }
  }, []);

  return (
    <>
      {showLogoutCountdown && (
        <LogoutCountdown 
          onCancel={() => setShowLogoutCountdown(false)}
        />
      )}
      <div className="min-h-screen bg-base-200">
      {/* Header */}
      <header className="navbar bg-base-100 border-b border-base-300">
        <div className="flex-1">
          <div className="dropdown">
              <ButtonAccount />
          </div>
        </div>
        
        <div className="flex-none gap-2">
          {userPlan === "" && (
            <ButtonCheckout
                    priceId="price_1R0PNQIpDPy0JgwZ33p7CznT"
                    mode="payment"
                    successUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?success=true"}
                    cancelUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?canceled=true"}
                    className="btn btn-primary btn-block"
            />
          )}
          
          <a href="mailto:support@poopup.co" className="btn btn-ghost">
            Feedback
          </a>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {isPageLoading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : showOnboarding ? (
          <div className="card bg-base-100">
            <div className="card-body">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-3">Welcome to NotiFast! 👋</h1>
                <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                  Let's get started by setting up your first website. PoopUps will help you engage visitors 
                  with beautiful notifications that increase conversion and engagement.
                </p>
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <label htmlFor="website" className="label">
                    <span className="label-text">What's your website domain?</span>
                  </label>
                  <div className="join w-full">
                    <input
                      type="text"
                      id="website"
                      placeholder="example.com"
                      value={newWebsite}
                      onChange={(e) => setNewWebsite(e.target.value)}
                      className="join-item input input-bordered flex-1"
                    />
                    <button
                      onClick={handleAddWebsite}
                      disabled={isSubmitting}
                      className="join-item btn btn-primary"
                    >
                      {isSubmitting ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <>Continue <FaArrowRight className="ml-2" /></>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="text-center text-sm text-base-content/60">
                  <p>You'll be able to add {isPro ? "unlimited" : "up to 1"} website{isPro ? "s" : ""}.</p>
                  {!isPro && (
                    <p className="mt-1">
                      <Link href="/pricing" className="link link-primary">
                        Upgrade to Pro
                      </Link>
                      {" "}for unlimited websites.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="divider">How it works</div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="card bg-base-200">
                  <div className="card-body items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h3 className="card-title text-base">Add your website</h3>
                    <p className="text-sm text-base-content/70">Enter your domain to get started</p>
                  </div>
                </div>
                
                <div className="card bg-base-200">
                  <div className="card-body items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h3 className="card-title text-base">Create notifications</h3>
                    <p className="text-sm text-base-content/70">Customize messages for your audience</p>
                  </div>
                </div>
                
                <div className="card bg-base-200">
                  <div className="card-body items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h3 className="card-title text-base">Add to your site</h3>
                    <p className="text-sm text-base-content/70">Paste one line of code</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Your Websites</h1>
              <button
                onClick={() => setShowOnboarding(true)}
                disabled={!isPro && websites.length >= 1}
                className={`btn btn-primary ${!isPro && websites.length >= 1 ? "btn-disabled" : ""}`}
              >
                <FaPlus className="mr-2" /> Add Website
                {!isPro && websites.length >= 1 && " (Upgrade to Pro)"}
              </button>
            </div>
            
            {websites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {websites.map((website) => (
                  <div 
                    key={website._id} 
                    onClick={() => handleWebsiteClick(website._id)}
                    className="card bg-base-100 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="card-body">
                      <div className="flex items-center mb-3">
                        <div className="avatar placeholder">
                          <div className="w-10 h-10 rounded-lg bg-primary text-primary-content font-bold">
                            <span>{website.domain.charAt(0).toUpperCase()}</span>
                          </div>
                        </div>
                        <h3 className="card-title ml-3">{website.domain}</h3>
                      </div>
                      
                      <p className="text-sm text-base-content/60">
                        {website.notificationCount || 0} notifications configured
                      </p>
                      
                      <div className="card-actions justify-end mt-4">
                        <span className="text-primary font-medium flex items-center">
                          Manage <FaArrowRight className="ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card bg-base-100">
                <div className="card-body items-center text-center">
                  <p className="text-base-content/60">No websites found. Add your first website to get started.</p>
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="btn btn-primary mt-4"
                  >
                    Add Website
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
    </>
  );
}
