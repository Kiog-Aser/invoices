"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const ButtonCheckout = ({ 
  priceId, 
  mode = "payment", 
  successUrl, 
  cancelUrl, 
  className = "btn btn-primary btn-wide" 
}: { 
  priceId: string;
  mode?: "payment" | "subscription";
  successUrl?: string;
  cancelUrl?: string;
  className?: string;
}) => {

  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);

    try {

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          mode: "payment",
          successUrl: window.location.origin + "/dashboard?success=true",
          cancelUrl: cancelUrl || window.location.href + "?canceled=true",
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

  return (
    <button
      className={className}
      onClick={() => handlePayment()}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-md"></span>
      ) : (
        "Get Pro Lifetime"
      )}
    </button>
  );
};

export default ButtonCheckout;