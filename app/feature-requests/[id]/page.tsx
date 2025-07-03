"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaUser } from "react-icons/fa";

// Status display mapping
const statusDisplay = {
  planned: "Planned",
  "in-progress": "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};

// Status colors for badges
const statusColors = {
  planned: "bg-indigo-100 text-indigo-800 border-indigo-300",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
};

interface Comment {
  id: string;  // Changed from _id to id to match toJSON plugin's transformation
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

interface FeatureRequest {
  id: string;  // Changed from _id to id to match toJSON plugin's transformation
  title: string;
  description: string;
  status: keyof typeof statusColors;
  votes: string[];
  userId: string;
  userName: string;
  comments: Comment[];
  createdAt: string;
}

export default function FeatureRequestDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [featureRequest, setFeatureRequest] = useState<FeatureRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [anonymousName, setAnonymousName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Define fetchFeatureRequest outside useEffect so it can be called from other functions
  const fetchFeatureRequest = async () => {
    try {
      setIsLoading(true);
      
      // Ensure ID is valid before making the API call
      if (!params.id || params.id === "undefined" || params.id === "null") {
        console.error('Invalid feature request ID:', params.id);
        throw new Error("Invalid feature request ID");
      }

      // Log the ID we're trying to fetch
      console.log('Fetching feature request with ID:', params.id);
      
      // Use the ID to fetch the feature request
      const response = await fetch(`/api/feature-requests/${params.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch feature request");
      }
      
      const data = await response.json();
      setFeatureRequest(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load feature request");
      router.push('/feature-requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch the data regardless of authentication status
    fetchFeatureRequest();
  }, [params.id, router]);

  const handleVote = async () => {
    if (sessionStatus !== "authenticated") {
      toast.error("You must be logged in to vote");
      return;
    }

    try {
      const response = await fetch(`/api/feature-requests/${params.id}/vote`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to vote");
      }
      
      fetchFeatureRequest();
      toast.success("Vote recorded!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to record your vote");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare the comment data, supporting anonymous comments
      const commentData = {
        comment: newComment,
        // For anonymous users, include a name or default to "Anonymous"
        ...(sessionStatus !== "authenticated" && {
          anonymousName: anonymousName.trim() || "Anonymous"
        })
      };
      
      const response = await fetch(`/api/feature-requests/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }
      
      toast.success("Comment added successfully");
      setNewComment("");
      setAnonymousName(""); // Clear anonymous name if used
      fetchFeatureRequest();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (sessionStatus !== "authenticated" || !session?.user?.isAdmin) {
      toast.error("You must be an admin to update status");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const response = await fetch(`/api/feature-requests/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: updateStatus }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      
      toast.success("Status updated!");
      fetchFeatureRequest();
      setUpdateStatus(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const hasUserVoted = (votes: string[] = []) => {
    return session?.user?.id ? votes.includes(session.user.id) : false;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex justify-center items-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (!featureRequest) {
    return (
      <div className="min-h-screen bg-base-100 flex justify-center items-center">
        <div className="bg-base-100 p-8 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] max-w-md text-center border border-base-content/10">
          <h2 className="text-2xl font-bold font-mono mb-4">
            Feature Request Not Found
          </h2>
          <p className="text-base-content/70 mb-6">
            The feature request you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/feature-requests"
            className="btn btn-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 font-mono inline-flex items-center gap-2"
          >
            <FaArrowLeft /> Back to Feature Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4">
          <Link
            href="/feature-requests"
            className="inline-flex items-center gap-2 text-base-content hover:text-primary transition-colors font-mono"
          >
            <FaArrowLeft className="text-primary" /> Back to all Feature Requests
          </Link>
        </div>

        {/* Two-column layout with feature info on left and comments on right */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column - Feature info */}
          <div className="w-full lg:w-2/5">
            <div className="bg-base-100 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] overflow-hidden mb-6 border border-base-content/10">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h1 className="text-xl md:text-2xl font-bold font-mono flex-1">
                    {featureRequest.title}
                  </h1>
                  <div className={`${statusColors[featureRequest.status]} px-3 py-1 rounded-full text-sm font-medium border shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] whitespace-nowrap`}>
                    {statusDisplay[featureRequest.status]}
                  </div>
                </div>
                
                {/* Compact info section */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Voting button - now more compact */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleVote}
                      disabled={sessionStatus !== "authenticated"}
                      className={`w-12 h-12 flex items-center justify-center rounded-md transition-all duration-200 ${
                        hasUserVoted(featureRequest.votes)
                          ? "bg-primary text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
                          : "bg-base-300 text-base-content/70 hover:bg-primary/20 hover:text-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[1px] hover:translate-y-[1px]"
                      } ${sessionStatus !== "authenticated" ? "cursor-not-allowed opacity-60" : ""}`}
                      aria-label="Vote"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19V5M5 12l7-7 7 7"/>
                      </svg>
                    </button>
                    <span className="font-bold text-lg mt-1 font-mono">
                      {featureRequest.votes.length}
                    </span>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex-1 text-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/70 font-mono">Submitted by:</span>
                      <span className="font-medium">{featureRequest.userName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/70 font-mono">Date:</span>
                      <span className="font-medium">{formatDate(featureRequest.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="prose max-w-none text-base-content/80 my-4 bg-base-200 p-4 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                  <p className="whitespace-pre-line">{featureRequest.description}</p>
                </div>
                
                {/* Admin Status Update */}
                {session?.user?.isAdmin && (
                  <div className="mt-4 p-4 bg-base-200 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10">
                    <h3 className="text-md font-semibold font-mono mb-3">
                      Admin Controls
                    </h3>
                    <div className="flex gap-3 flex-col sm:flex-row">
                      <div className="flex-1">
                        <select
                          value={updateStatus || ""}
                          onChange={(e) => setUpdateStatus(e.target.value || null)}
                          className="select select-bordered w-full select-sm"
                        >
                          <option value="">Select a status...</option>
                          {Object.keys(statusDisplay).map((status) => (
                            <option key={status} value={status}>
                              {statusDisplay[status as keyof typeof statusDisplay]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={handleUpdateStatus}
                        disabled={!updateStatus || isUpdatingStatus}
                        className="btn btn-primary btn-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-mono"
                      >
                        {isUpdatingStatus ? "Updating..." : "Update Status"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right column - Comments */}
          <div className="w-full lg:w-3/5">
            <div className="bg-base-100 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] overflow-hidden border border-base-content/10">
              <div className="border-b border-base-content/10 px-4 py-3">
                <h2 className="text-lg font-bold font-mono">
                  Comments ({featureRequest.comments.length})
                </h2>
              </div>
              
              <div className="p-4">
                {/* Add Comment Form - at the top for better UX */}
                <div id="comment-form" className="mb-6 bg-base-200 p-4 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                  <form onSubmit={handleSubmitComment}>
                    <div className="mb-3">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-base-content/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100"
                        placeholder="Add your comment..."
                        required
                      ></textarea>
                    </div>
                    
                    {/* Anonymous name field for non-authenticated users */}
                    {sessionStatus !== "authenticated" && (
                      <div className="mb-3">
                        <input
                          type="text"
                          value={anonymousName}
                          onChange={(e) => setAnonymousName(e.target.value)}
                          className="input input-bordered input-sm w-full"
                          placeholder="Your name (optional, defaults to 'Anonymous')"
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary btn-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-mono"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Add Comment
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
                
                {/* Comments List */}
                {featureRequest.comments.length === 0 ? (
                  <div className="text-center py-6 text-base-content/60 font-mono">
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {featureRequest.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border-b border-base-content/10 last:border-0 pb-4 last:pb-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-base-200 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0 border border-base-content/10 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] text-sm">
                            {comment.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium font-mono text-sm">
                                {comment.userName}
                              </span>
                              <span className="text-xs text-base-content/60">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-base-content/80 whitespace-pre-line bg-base-200 p-3 rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] text-sm">
                              {comment.text}
                            </p>
                            
                            {/* Reply button */}
                            <button 
                              onClick={() => {
                                // Pre-fill the comment box with @username to indicate a reply
                                setNewComment(`@${comment.userName} `);
                                // Scroll to comment form
                                document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="mt-1 text-primary hover:text-primary-focus text-xs font-mono inline-flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                              </svg>
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
