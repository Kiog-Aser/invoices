"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FaEdit, FaExclamationTriangle, FaEye, FaCheck, FaHourglass, FaTimes } from "react-icons/fa";

// Status display mapping
const statusDisplay = {
  requested: "Requested",
  planned: "Planned",
  "in-progress": "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};

// Status colors
const statusColors = {
  requested: "bg-amber-100 text-amber-800 border-amber-300",
  planned: "bg-indigo-100 text-indigo-800 border-indigo-300",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
};

// Status icons
const statusIcons = {
  requested: <FaExclamationTriangle className="text-amber-500" />,
  planned: <FaHourglass className="text-indigo-500" />,
  "in-progress": <FaEdit className="text-blue-500" />,
  completed: <FaCheck className="text-green-500" />,
  rejected: <FaTimes className="text-red-500" />,
};

interface FeatureRequest {
  id: string;  // Changed from _id to id to match toJSON plugin's transformation
  title: string;
  description: string;
  status: keyof typeof statusColors;
  votes: string[];
  userId: string;
  userName: string;
  userEmail: string;
  comments: {
    id: string;  // Changed from _id to id to match toJSON plugin's transformation
    userId: string;
    userName: string;
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
}

export default function AdminFeatureRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<FeatureRequest | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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
      fetchFeatureRequests();
    }
  }, [status, session, filter]);

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
      setFeatureRequests(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load feature requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) {
      toast.error("Please select a valid status");
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/feature-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      
      toast.success(`Status updated to ${statusDisplay[newStatus as keyof typeof statusDisplay]}`);
      setShowStatusModal(false);
      setSelectedRequest(null);
      setNewStatus("");
      fetchFeatureRequests();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const openStatusModal = (request: FeatureRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setShowStatusModal(true);
  };

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
            <h1 className="text-3xl font-bold mb-2">Feature Requests Admin</h1>
            <div className="breadcrumbs text-sm">
              <ul>
                <li><Link href="/admin">Admin</Link></li>
                <li>Feature Requests</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="btn btn-outline">
              Back to Admin
            </Link>
            <Link href="/feature-requests" className="btn btn-primary">
              View Public Page
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="tabs tabs-boxed mb-6">
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

        {/* Feature requests table */}
        <div className="bg-base-100 rounded-lg overflow-hidden shadow-lg border border-base-300">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Votes</th>
                  <th>Submitted By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {featureRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      No feature requests found
                    </td>
                  </tr>
                ) : (
                  featureRequests.map((request) => (
                    <tr key={request.id} className="hover">
                      <td>
                        <div className="font-medium">{request.title}</div>
                        <div className="text-sm opacity-70 truncate max-w-xs">
                          {request.description.substring(0, 100)}
                          {request.description.length > 100 ? "..." : ""}
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${statusColors[request.status]} gap-1 py-3 px-3`}>
                          {statusIcons[request.status]}
                          <span>{statusDisplay[request.status]}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="font-bold">{request.votes.length}</span>
                      </td>
                      <td>
                        <div className="font-medium">{request.userName}</div>
                        <div className="text-xs opacity-70">{request.userEmail}</div>
                      </td>
                      <td>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Link
                            href={`/feature-requests/${request.id}`}
                            className="btn btn-sm btn-outline btn-circle"
                            title="View"
                          >
                            <FaEye />
                          </Link>
                          <button
                            onClick={() => openStatusModal(request)}
                            className="btn btn-sm btn-outline btn-circle"
                            title="Update Status"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">
                Update Status for "{selectedRequest.title}"
              </h3>
              
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Select New Status</span>
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
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
                  onClick={() => setShowStatusModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating || newStatus === selectedRequest.status}
                  className="btn btn-primary"
                >
                  {isUpdating ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Updating...
                    </>
                  ) : (
                    "Update Status"
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
