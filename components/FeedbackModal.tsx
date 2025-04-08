"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FaTimes, FaPaperPlane } from "react-icons/fa";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageContext?: string; // Optional context about which page the feedback is coming from
}

export default function FeedbackModal({ isOpen, onClose, pageContext }: FeedbackModalProps) {
  const { data: session } = useSession();
  const [feedback, setFeedback] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      toast.error("Please enter your feedback");
      return;
    }
    
    if (!session?.user) {
      toast.error("You must be logged in to submit feedback");
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
          content: pageContext ? `[${pageContext}] ${feedback}` : feedback,
          isPublic,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }
      
      toast.success("Feedback submitted successfully!");
      setFeedback("");
      setIsPublic(false);
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" 
          aria-hidden="true"
        ></div>
        
        <div 
          className="relative bg-base-100 w-full max-w-md mx-auto rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] p-6 border-2 border-base-content/10 transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-3 right-3">
            <button
              onClick={onClose}
              className="btn btn-sm btn-ghost btn-circle"
              aria-label="Close feedback form"
            >
              <FaTimes />
            </button>
          </div>
          
          <h3 className="text-lg font-bold font-mono mb-1">Share Your Feedback</h3>
          <p className="text-sm text-base-content/70 mb-4">We'd love to hear your thoughts or suggestions!</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What's on your mind? (suggestions, issues, praise...)"
                className="textarea textarea-bordered h-32 w-full resize-none focus:ring-2 focus:ring-primary font-mono"
                required
              ></textarea>
            </div>
            
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="checkbox checkbox-sm checkbox-primary"
                />
                <span className="label-text">Make feedback public (may be displayed on the website)</span>
              </label>
            </div>
            
            {!session?.user && (
              <div className="alert alert-warning shadow-lg">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span>You must be logged in to submit feedback</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !session?.user}
                className="btn btn-primary gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[1px] hover:translate-x-[1px] transition-all"
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
