"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import config from "@/config";

interface Testimonial {
  _id: string;
  name: string;
  socialHandle?: string;
  socialPlatform?: 'twitter' | 'linkedin';
  profileImage?: string;
  reviewType: 'text' | 'video';
  textReview?: string;
  videoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
}

const TestimonialCard = ({ testimonial, isFeatured = false }: { testimonial: Testimonial; isFeatured?: boolean }) => {
  return (
    <div className={`rounded-2xl bg-base-200 p-6 ${isFeatured ? 'md:col-span-2' : ''}`}>
      <figure className="space-y-6">
        {testimonial.reviewType === 'text' ? (
          <blockquote>
            <p className={`text-base-content/80 leading-relaxed ${isFeatured ? 'md:text-lg' : ''}`}>
              {testimonial.textReview}
            </p>
          </blockquote>
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

        <figcaption className="flex items-center gap-x-4">
          <div className="overflow-hidden rounded-full bg-base-300 shrink-0">
            {testimonial.profileImage ? (
              <Image
                className="h-12 w-12 rounded-full object-cover"
                src={testimonial.profileImage}
                alt={`${testimonial.name}'s testimonial for ${config.appName}`}
                width={48}
                height={48}
              />
            ) : (
              <span className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-medium bg-base-300">
                {testimonial.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <div className="font-medium text-base-content">
              {testimonial.name}
            </div>
            {testimonial.socialHandle && (
              <a
                href={`https://${testimonial.socialPlatform}.com/${testimonial.socialHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-base-content/60 hover:text-primary"
              >
                @{testimonial.socialHandle}
              </a>
            )}
          </div>
        </figcaption>
      </figure>
    </div>
  );
};

export default function Testimonials11() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.details || 'Failed to fetch testimonials');
        }
        const data = await response.json();
        setTestimonials(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError(err instanceof Error ? err.message : 'Failed to load testimonials');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (isLoading) {
    return (
      <section id="testimonials" className="py-24 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="testimonials" className="py-24 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section id="testimonials" className="py-24 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>No testimonials available yet.</span>
          </div>
        </div>
      </section>
    );
  }

  const displayedTestimonials = testimonials.slice(0, 11); // Only show first 11
  const featuredTestimonial = displayedTestimonials.pop(); // Last one becomes featured

  return (
    <section id="testimonials" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Our Happy Users
          </h2>
          <p className="mt-4 text-lg leading-8 text-base-content/70">
            Don&apos;t take our word for it. Here&apos;s what our users say
            about {config.appName}.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial._id} testimonial={testimonial} />
          ))}
          {featuredTestimonial && (
            <TestimonialCard 
              key={featuredTestimonial._id}
              testimonial={featuredTestimonial}
              isFeatured={true}
            />
          )}
        </div>
      </div>
    </section>
  );
}
