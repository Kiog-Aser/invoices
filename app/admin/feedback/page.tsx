"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaReply, FaSearch } from "react-icons/fa";

// Status display mapping
const statusDisplay = {
  pending: "Pending",
  reviewed: "Reviewed",
  resolved: "Resolved",
};

// Status colors
const statusColors = {
  pending: "bg-amber-100 text-amber-800",
  reviewed: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
};

interface Feedback {
  _id: string;
  content: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: keyof typeof statusColors;
  isPublic: boolean;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminFeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const [newStatus, setNewStatus] = useState<keyof typeof statusColors>("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && !session?.user?.isAdmin) {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated" && session?.user?.isAdmin) {
      fetchFeedback();
    }
  }, [status, session, filter]);

  const fetchFeedback = async () => {
    try {
      setIsLoading(true);
      const url = filter
        ? `/api/feedback?status=${filter}`
        : "/api/feedback";
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }
      
      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load feedback");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedFeedback) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/feedback/${selectedFeedback._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminResponse,
          status: newStatus,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update feedback");
      }
      
      toast.success("Response submitted successfully");
      setShowResponseModal(false);
      setSelectedFeedback(null);
      setAdminResponse("");
      fetchFeedback();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit response");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openResponseModal = (feedbackItem: Feedback) => {
    setSelectedFeedback(feedbackItem);
    setAdminResponse(feedbackItem.adminResponse || "");
    setNewStatus(feedbackItem.status);
    setShowResponseModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredFeedback = feedback.filter((item) => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      item.content.toLowerCase().includes(searchLower) ||
      item.userName.toLowerCase().includes(searchLower) ||
      item.userEmail.toLowerCase().includes(searchLower)
    );
  });

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Feedback</h1>
            <div className="breadcrumbs text-sm">
              <ul>
                <li><Link href="/admin">Admin</Link></li>
                <li>Feedback</li>
              </ul>
            </div>
          </div>
          <Link href="/admin" className="btn btn-outline">
            Back to Admin
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          {/* Filter tabs */}
          <div className="tabs tabs-boxed">
            <button
              onClick={() => setFilter(null)}
              className={`tab ${filter === null ? "tab-active" : ""}`}
            >
              All
            </button>
            {Object.entries(statusDisplay).map(([status, label]) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`tab ${filter === status ? "tab-active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search feedback..."
                className="input input-bordered"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-square">
                <FaSearch />
              </button>
            </div>
          </div>
        </div>

        {/* Feedback cards */}
        {filteredFeedback.length === 0 ? (
          <div className="bg-base-200 rounded-lg p-8 text-center">
            <p className="text-lg">No feedback found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredFeedback.map((item) => (
              <div
                key={item._id}
                className="bg-base-100 rounded-lg shadow-lg border border-base-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        {item.userName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-base-content/70">
                        <FaEnvelope size={12} />
                        <span>{item.userEmail}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`badge ${statusColors[item.status]} py-3 px-3`}>
                        {statusDisplay[item.status]}
                      </div>
                      <div className="badge badge-outline py-3 px-3">
                        {item.isPublic ? "Public" : "Private"}
                      </div>
                      <div className="text-sm text-base-content/70">
                        {formatDate(item.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-base-200 p-4 rounded-lg mb-4">
                    <p className="whitespace-pre-line">{item.content}</p>
                  </div>

                  {item.adminResponse && (
                    <div className="bg-base-200 p-4 rounded-lg mb-4 border-l-4 border-primary">
                      <h4 className="font-medium mb-2 text-sm">Admin Response:</h4>
                      <p className="whitespace-pre-line">{item.adminResponse}</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => openResponseModal(item)}
                      className="btn btn-primary btn-sm gap-2"
                    >
                      <FaReply />
                      {item.adminResponse ? "Edit Response" : "Respond"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">
                Respond to Feedback from {selectedFeedback.userName}
              </h3>

              <div className="bg-base-200 p-4 rounded-lg mb-6">
                <h4 className="font-medium mb-2 text-sm">Original Feedback:</h4>
                <p className="whitespace-pre-line">{selectedFeedback.content}</p>
              </div>
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Your Response</span>
                </label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="textarea textarea-bordered h-32"
                  placeholder="Write your response here..."
                ></textarea>
              </div>
              
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Update Status</span>
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as keyof typeof statusColors)}
                  className="select select-bordered w-full"
                >
                  {Object.entries(statusDisplay).map(([status, label]) => (
                    <option key={status} value={status}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowResponseModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitResponse}
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Submitting...
                    </>
                  ) : (
                    "Submit Response"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
