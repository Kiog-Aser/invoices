"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const ButtonCheckout = ({ 
  priceId, 
  mode = "payment", 
  successUrl, 
  cancelUrl, 
  className = "btn btn-primary btn-wide",
  children,
  asLink = false
}: { 
  priceId: string;
  mode?: "payment" | "subscription";
  successUrl?: string;
  cancelUrl?: string;
  className?: string;
  children?: React.ReactNode;
  asLink?: boolean;
}) => {

  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // Ensure we use the correct domain for success/cancel URLs
      const domain = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://notifast.fun';

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          mode,
          successUrl: successUrl || `${domain}/dashboard/success`,
          cancelUrl: cancelUrl || `${domain}/dashboard`,
          // Pass the user ID in the request so it can be included in client_reference_id
          userId: session?.user?.id
        }),
      });

      const data = await response.json();
      
      console.log("Checkout API response:", data);
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (!data.url) {
        throw new Error("No checkout URL returned from API");
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (asLink) {
    return (
      <a 
        href="#" 
        className={className} 
        onClick={(e) => {
          e.preventDefault();
          handlePayment();
        }}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          children || "Upgrade to Pro"
        )}
      </a>
    );
  }

  return (
    <button
      className={className}
      onClick={() => handlePayment()}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-md"></span>
      ) : (
        children || "Get Pro Lifetime"
      )}
    </button>
  );
};

export default ButtonCheckout;