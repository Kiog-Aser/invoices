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

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials/admin');
        if (!response.ok) throw new Error('Failed to fetch testimonials');
        const data = await response.json();
        setTestimonials(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load testimonials');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
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

  if (status === "loading" || isLoading) {
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
        <h1 className="text-3xl font-bold mb-8">Testimonials Dashboard</h1>
        
        <div className="space-y-6">
          {testimonials.map((testimonial) => (
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
                          <p className="whitespace-pre-wrap">{testimonial.textReview}</p>
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
          ))}
        </div>
      </div>
    </div>
  );
}