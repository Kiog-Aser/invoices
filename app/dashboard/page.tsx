'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import ButtonCheckout from "@/components/ButtonCheckout";
import ButtonAccount from "@/components/ButtonAccount";
import { setupStripeSuccessListener } from "@/libs/refreshSession";

interface Website {
  _id: string;
  domain: string;
  notificationCount?: number;
}

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newWebsite, setNewWebsite] = useState("");

  // Check pro status whenever session changes
  useEffect(() => {
    const checkProStatus = async () => {
      if (session?.user?.plan === 'pro') {
        setIsPro(true);
      } else if (status === 'authenticated') {
        try {
          const userResponse = await fetch('/api/user');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setIsPro(userData.plan === 'pro');
          } else {
            console.error('Failed to fetch user data:', await userResponse.text());
            toast.error('Failed to load user data. Please refresh the page.');
          }
        } catch (error) {
          console.error('Error checking pro status:', error);
          toast.error('Error loading user data. Please refresh the page.');
        }
      }
      setIsLoading(false);
    };
    
    checkProStatus();
  }, [session, status]);

  // Check for success parameter in URL - this happens after Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      // Remove the success parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      window.history.replaceState({}, document.title, url.toString());
      
      toast.success('Payment successful! Updating your account...');
      setupStripeSuccessListener();
    }
  }, [searchParams]);

  // Fetch websites when session is loaded
  useEffect(() => {
    const fetchData = async () => {
      if (status === 'unauthenticated') {
        return;
      }

      if (status !== 'loading') {
        try {
          const websitesResponse = await fetch('/api/websites');
          if (!websitesResponse.ok) {
            throw new Error('Failed to fetch websites');
          }
          const websitesData = await websitesResponse.json();
          setWebsites(websitesData);
          setShowOnboarding(websitesData.length === 0);
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Failed to load data');
        }
      }
    };
    
    fetchData();
  }, [status]);

  const handleAddWebsite = async () => {
    if (!newWebsite) {
      toast.error("Please enter a domain name");
      return;
    }
    
    if (!isPro && websites.length >= 1) {
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
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to add website');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWebsiteClick = (websiteId: string) => {
    router.push(`/dashboard/notifications/${websiteId}`);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200">
      <header className="navbar bg-base-100 border-b border-base-300">
        <div className="flex-1">
          <div className="dropdown">
            <ButtonAccount />
          </div>
        </div>
        
        <div className="flex-none gap-2">
          {!isPro && (
            <ButtonCheckout
              priceId="price_1R0PNQIpDPy0JgwZ33p7CznT"
              mode="payment"
              successUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard?success=true`}
              cancelUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard?canceled=true`}
              className="btn btn-primary"
            />
          )}
          
          {isPro && (
            <a href="mailto:support@notifast.fun" className="btn btn-ghost">
              Feedback
            </a>
          )}
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {showOnboarding ? (
          <div className="card bg-base-100">
            <div className="card-body">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-3">Welcome to NotiFast! 👋</h1>
                <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                  Let's get started by setting up your first website. NotiFast will help you engage visitors 
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
                      <ButtonCheckout
                        priceId="price_1R0PNQIpDPy0JgwZ33p7CznT"
                        mode="payment"
                        successUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard?success=true`}
                        cancelUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard?canceled=true`}
                        asLink={true}
                        className="link link-primary"
                      >
                        Upgrade to Pro
                      </ButtonCheckout>
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
  );
}
