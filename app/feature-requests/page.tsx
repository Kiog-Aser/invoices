"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FaChevronUp, FaPlus, FaComment, FaUser } from "react-icons/fa";

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

interface FeatureRequest {
  id: string;  // Changed from _id to id to match toJSON plugin's transformation
  title: string;
  description: string;
  status: keyof typeof statusColors;
  votes: string[];
  userId: string;
  userName: string;
  comments: {
    id: string;  // Changed from _id to id to match toJSON plugin's transformation
    userId: string;
    userName: string;
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
}

export default function FeatureRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [newRequest, setNewRequest] = useState({ title: "", description: "", name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Store votes in localStorage for anonymous users
  const [anonymousVotes, setAnonymousVotes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchFeatureRequests();
    
    // Load anonymous votes from localStorage
    if (typeof window !== 'undefined') {
      const savedVotes = localStorage.getItem('anonymousFeatureVotes');
      if (savedVotes) {
        try {
          setAnonymousVotes(JSON.parse(savedVotes));
        } catch (e) {
          console.error('Failed to parse saved votes:', e);
          localStorage.removeItem('anonymousFeatureVotes');
        }
      }
    }
  }, [filter]);

  const fetchFeatureRequests = async () => {
    try {
      setIsLoading(true);
      const url = filter
        ? `/api/feature-requests?status=${filter}`
        : "/api/feature-requests";
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch feature requests");
      }
      
      const data = await response.json();
      
      // Filter out rejected features from the "All" view
      if (filter === null) {
        setFeatureRequests(data.filter((request: FeatureRequest) => request.status !== 'rejected'));
      } else {
        setFeatureRequests(data);
      }
      
      // Log the filtered data for debugging
      console.log(`Fetched ${filter || 'All'} feature requests:`, 
        filter === null ? 
          `${data.length} total, ${data.filter((r: FeatureRequest) => r.status !== 'rejected').length} non-rejected` : 
          data.length
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load feature requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (id: string) => {
    // For authenticated users, use the API
    if (status === "authenticated") {
      try {
        const response = await fetch(`/api/feature-requests/${id}/vote`, {
          method: "POST",
        });
        
        if (!response.ok) {
          throw new Error("Failed to vote");
        }
        
        // Refresh the feature requests to show updated vote count
        fetchFeatureRequests();
        toast.success("Vote recorded successfully!");
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to record your vote");
      }
    } else {
      // For anonymous users, use localStorage
      if (anonymousVotes[id]) {
        // Already voted - remove vote
        const newVotes = { ...anonymousVotes };
        delete newVotes[id];
        setAnonymousVotes(newVotes);
        localStorage.setItem('anonymousFeatureVotes', JSON.stringify(newVotes));
        
        // Update the UI immediately without waiting for API
        setFeatureRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === id 
              ? { ...req, votes: req.votes.filter(v => v !== 'anonymous') } 
              : req
          )
        );
        toast.success("Vote removed successfully!");
      } else {
        // New vote
        const newVotes = { ...anonymousVotes, [id]: true };
        setAnonymousVotes(newVotes);
        localStorage.setItem('anonymousFeatureVotes', JSON.stringify(newVotes));
        
        try {
          const response = await fetch(`/api/feature-requests/${id}/anonymous-vote`, {
            method: "POST",
          });
          
          if (!response.ok) {
            throw new Error("Failed to vote");
          }
          
          // Refresh the feature requests to show updated vote count
          fetchFeatureRequests();
          toast.success("Vote recorded successfully!");
        } catch (error) {
          console.error("Error:", error);
          toast.error("Failed to record your vote");
        }
      }
    }
  };

  const handleSubmitNewRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRequest.title.trim() || !newRequest.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare submission data based on authentication status
      const submissionData = {
        ...newRequest,
        // Use provided name for anonymous users or default to "Anonymous"
        ...(status !== "authenticated" && { 
          anonymous: true,
          userName: newRequest.name?.trim() || "Anonymous" 
        })
      };
      
      const response = await fetch("/api/feature-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit feature request");
      }
      
      toast.success("Feature request submitted!");
      setNewRequest({ title: "", description: "", name: "" });
      fetchFeatureRequests();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit feature request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasUserVoted = (votes: string[]) => {
    if (session?.user?.id) {
      // For authenticated users, check if their ID is in the votes array
      return votes.includes(session.user.id);
    } else {
      // For anonymous users, check localStorage
      const featureId = votes.length > 0 && featureRequests.find(req => 
        req.votes === votes
      )?.id;
      
      return featureId ? !!anonymousVotes[featureId] : false;
    }
  };

  const handleDeleteFeature = async (id: string) => {
    try {
      const response = await fetch(`/api/feature-requests/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete feature request");
      }
      toast.success("Feature request deleted!");
      setFeatureRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete feature request");
    }
  };
  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">Feature Requests</h1>
          <p className="mt-2 text-base-content/70">
            Vote for features you'd like to see or suggest your own ideas
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Feature request form */}
          <div className="lg:w-1/3">
            <div className="bg-base-100 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] border border-base-content/10">
              <div className="p-6">
                <h2 className="font-bold text-xl mb-4 font-mono">Suggest a feature</h2>
                
                <form onSubmit={handleSubmitNewRequest}>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newRequest.title}
                      onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={newRequest.description}
                      onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                      rows={5}
                      className="textarea textarea-bordered w-full"
                      required
                    ></textarea>
                  </div>
                  
                  {!session && (
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Your Name (for anonymous users)
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={newRequest.name || ""}
                        onChange={(e) => setNewRequest({ ...newRequest, name: e.target.value })}
                        className="input input-bordered w-full"
                        placeholder="Anonymous"
                      />
                      <p className="text-xs text-base-content/60 mt-1">
                        Not logged in? No problem! You can still submit feature requests anonymously.
                      </p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 w-full font-mono"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaPlus size={14} className="mr-1" /> Submit Feature Request
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          {/* Right column - Feature requests list */}
          <div className="lg:w-2/3">
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : featureRequests.length === 0 ? (
              <div className="bg-base-200 rounded-lg p-8 text-center">
                <p className="text-lg">
                  No feature requests found. Be the first to suggest a feature!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {featureRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-base-100 rounded-lg border border-base-content/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 overflow-hidden flex p-4"
                  >
                    {/* Content area - left side */}
                    <div className="flex-1 pr-4 relative">
                      <Link 
                        href={`/feature-requests/${request.id}`}
                        className="hover:no-underline"
                      >
                        <h3 className="font-semibold text-lg text-base-content hover:text-primary font-mono transition-colors duration-200">
                          {request.title}
                        </h3>
                        <div className="mt-1 mb-2">
                          <p className="text-base-content/70 line-clamp-2">
                            {request.description}
                          </p>
                        </div>
                        <div className="flex items-center text-sm text-base-content/50">
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            {request.comments.length}
                          </span>
                          
                          {/* Only show status badge if the feature has a valid status */}
                          {request.status && statusDisplay[request.status] && (
                            <span className={`badge ${statusColors[request.status]} py-0.5 px-2 text-xs ml-2`}>
                              {statusDisplay[request.status]}
                            </span>
                          )}
                          
                          {session?.user?.isAdmin && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (window.confirm("Are you sure you want to delete this feature request?")) {
                                  handleDeleteFeature(request.id);
                                }
                              }}
                              className="ml-2 text-error opacity-70 hover:opacity-100 transition-opacity p-1"
                              aria-label="Delete feature request"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      </Link>
                    </div>
                    
                    {/* Vote column - right side */}
                    <div className="flex flex-col items-center justify-center ml-2">
                      <button
                        onClick={() => handleVote(request.id)}
                        className={`flex items-center justify-center rounded-md w-10 h-10 transition-all duration-200 ${
                          hasUserVoted(request.votes)
                            ? "bg-primary text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
                            : "bg-base-200 text-base-content/70 hover:bg-primary/20 hover:text-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                        }`}
                        aria-label="Vote"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 19V5M5 12l7-7 7 7"/>
                        </svg>
                      </button>
                      <span className="font-bold text-lg mt-2 font-mono">
                        {request.votes.length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
