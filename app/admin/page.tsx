"use client";

// Ensure this page is rendered dynamically at request time
export const dynamic = 'force-dynamic';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-base-200 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Testimonials Card */}
          <Link href="/admin/testimonials" className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Testimonials
              </h2>
              <p>Review and moderate user testimonials before they appear on the site.</p>
              <div className="card-actions justify-end mt-4">
                <div className="badge badge-secondary">Reviews</div>
                <div className="badge badge-secondary">Approvals</div>
              </div>
            </div>
          </Link>
          
          {/* Feature Requests Card */}
          <Link href="/admin/feature-requests" className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Feature Requests
              </h2>
              <p>Manage user-submitted feature requests and update their status.</p>
              <div className="card-actions justify-end mt-4">
                <div className="badge badge-primary">Voting</div>
                <div className="badge badge-primary">Roadmap</div>
              </div>
            </div>
          </Link>
          
          {/* Feedback Card */}
          <Link href="/admin/feedback" className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                User Feedback
              </h2>
              <p>Review and respond to feedback submitted by users.</p>
              <div className="card-actions justify-end mt-4">
                <div className="badge badge-secondary">Support</div>
                <div className="badge badge-secondary">Responses</div>
              </div>
            </div>
          </Link>
          
          {/* Dashboard Link */}
          <Link href="/dashboard" className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Dashboard
              </h2>
              <p>Return to your regular user dashboard to manage your own content.</p>
              <div className="card-actions justify-end mt-4">
                <div className="badge">User View</div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}