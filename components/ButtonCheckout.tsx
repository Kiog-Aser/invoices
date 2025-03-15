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
    try {
      setIsLoading(true);

      const response = await apiClient.post('/stripe/create-checkout', {
        priceId,
        successUrl: successUrl || window.location.href + "?success=true",
        cancelUrl: cancelUrl || window.location.href + "?canceled=true",
        userId: session?.user?.id // Ensure we're passing the user ID
      });

      const data = await response.json();
      
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
      toast.error("Failed to initiate checkout. Please try again.");
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
