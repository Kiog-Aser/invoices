"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FaPaperPlane, FaArrowLeft, FaLock } from "react-icons/fa";

export default function FeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feedbackContent, setFeedbackContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackContent.trim()) {
      toast.error("Please enter your feedback");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: feedbackContent,
          isPublic,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }
      
      toast.success("Thank you for your feedback!");
      setFeedbackContent("");
      setIsPublic(false);
      
      // Redirect to dashboard after successful submission
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-amber-50 flex justify-center items-center">
        <div className="loading loading-spinner loading-lg text-orange-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-amber-50 flex justify-center items-center p-4">
        <div className="bg-white border-2 border-amber-300 rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-orange-800 mb-4">
            Authentication Required
          </h2>
          <p className="text-orange-700 mb-6">
            You need to be logged in to submit feedback.
          </p>
          <Link
            href="/auth/signin"
            className="btn bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-orange-600 hover:text-orange-800 inline-flex items-center gap-2"
          >
            <FaArrowLeft /> Back to Dashboard
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-orange-800 font-mono">
              Submit Feedback
            </h1>
            <p className="text-lg text-orange-700">
              We'd love to hear your thoughts! Your feedback helps us improve.
            </p>
          </div>

          <div className="bg-white border-2 border-amber-300 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-amber-500 text-white py-3 px-6">
              <h2 className="text-xl font-bold">Your Feedback</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label
                  htmlFor="feedback"
                  className="block text-orange-800 font-medium mb-2"
                >
                  Tell us what you think
                </label>
                <textarea
                  id="feedback"
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="Share your experience, suggestions, or report any issues..."
                  required
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="checkbox checkbox-warning"
                  />
                  <span className="text-orange-700">
                    Allow us to share this feedback publicly (optional)
                  </span>
                </label>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-orange-600">
                  <FaLock size={14} />
                  <span className="text-sm">
                    Your feedback is private by default
                  </span>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane /> Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-orange-700">
              Looking for new features?{" "}
              <Link
                href="/feature-requests"
                className="text-blue-600 hover:underline"
              >
                Check out our feature request page
              </Link>{" "}
              to suggest or vote on ideas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
