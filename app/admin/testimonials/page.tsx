"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface Testimonial {
  _id: string;
  name: string;
  socialHandle?: string;
  socialPlatform?: 'twitter' | 'linkedin';
  profileImage?: string;
  howHelped: string;
  beforeChallenge: string;
  afterSolution: string;
  reviewType: 'text' | 'video';
  textReview?: string;
  videoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function TestimonialsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials/admin');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch testimonials');
        }
        const data = await response.json();
        setTestimonials(data);
        setError(null);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to load testimonials');
        toast.error('Failed to load testimonials');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.isAdmin) {
      fetchTestimonials();
    }
  }, [session]);

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/testimonials/admin/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      setTestimonials(prev => 
        prev.map(t => t._id === id ? { ...t, status: newStatus } : t)
      );
      
      toast.success(`Testimonial ${newStatus}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update status');
    }
  };

  if (status === "loading" || (session?.user?.isAdmin && isLoading)) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Testimonials Dashboard</h1>
        
        <div className="space-y-6">
          {testimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base-content/70">No testimonials yet</p>
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <div key={testimonial._id} className="card bg-base-200">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    {/* User info */}
                    <div className="flex-shrink-0">
                      {testimonial.profileImage ? (
                        <Image
                          src={testimonial.profileImage}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {testimonial.name[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                          {testimonial.socialHandle && (
                            <a
                              href={`https://${testimonial.socialPlatform}.com/${testimonial.socialHandle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-base-content/60 hover:text-primary"
                            >
                              @{testimonial.socialHandle} on {testimonial.socialPlatform}
                            </a>
                          )}
                        </div>
                        <div className="space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(testimonial._id, 'approved')}
                            className={`btn btn-sm ${
                              testimonial.status === 'approved' ? 'btn-success' : 'btn-ghost'
                            }`}
                            disabled={testimonial.status === 'approved'}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(testimonial._id, 'rejected')}
                            className={`btn btn-sm ${
                              testimonial.status === 'rejected' ? 'btn-error' : 'btn-ghost'
                            }`}
                            disabled={testimonial.status === 'rejected'}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        {testimonial.reviewType === 'text' ? (
                          <div className="prose max-w-none">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium">How NotiFast helped:</h4>
                                <p className="text-base-content/80">{testimonial.howHelped}</p>
                              </div>
                              <div>
                                <h4 className="font-medium">Before NotiFast:</h4>
                                <p className="text-base-content/80">{testimonial.beforeChallenge}</p>
                              </div>
                              <div>
                                <h4 className="font-medium">After NotiFast:</h4>
                                <p className="text-base-content/80">{testimonial.afterSolution}</p>
                              </div>
                              {testimonial.textReview && (
                                <div>
                                  <h4 className="font-medium">Full Review:</h4>
                                  <p className="whitespace-pre-wrap text-base-content/80">{testimonial.textReview}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video">
                            <iframe
                              src={testimonial.videoUrl}
                              className="w-full h-full rounded-lg"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 flex items-center gap-2">
                        <span className={`badge ${
                          testimonial.status === 'pending'
                            ? 'badge-warning'
                            : testimonial.status === 'approved'
                            ? 'badge-success'
                            : 'badge-error'
                        }`}>
                          {testimonial.status}
                        </span>
                        <span className="text-sm text-base-content/60">
                          {new Date(testimonial.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}