"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
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
}

// A beautiful single testimonial with a user image and video/text content
const Testimonial = () => {
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) throw new Error('Failed to fetch testimonials');
        const data = await response.json();
        // Use the first testimonial for this component
        if (data.length > 0) {
          setTestimonial(data[0]);
        }
      } catch (error) {
        console.error('Error fetching testimonial:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonial();
  }, []);

  if (isLoading) {
    return (
      <section className="relative isolate overflow-hidden bg-base-100 px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:max-w-5xl flex justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </section>
    );
  }

  if (!testimonial) return null;

  return (
    <section
      className="bg-base-300 min-h-[90vh] lg:min-h-screen flex items-center py-16 sm:py-20 md:py-24 lg:py-28 relative overflow-hidden"
      id="testimonials"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.base-300),theme(colors.base-100))] opacity-20" />
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-base-100 shadow-lg ring-1 ring-base-content/10 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
      <div className="mx-auto max-w-2xl lg:max-w-5xl">
        <figure className="mt-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {testimonial.reviewType === 'video' ? (
              <div className="w-full lg:w-1/2 aspect-video rounded-xl">
                <iframe
                  src={testimonial.videoUrl}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative rounded-xl border border-base-content/5 bg-base-content/5 p-1.5 sm:-rotate-1">
                {testimonial.profileImage ? (
                  <Image
                    width={320}
                    height={320}
                    className="rounded-lg max-w-[320px] md:max-w-[280px] lg:max-w-[320px] object-cover"
                    src={testimonial.profileImage}
                    alt={`${testimonial.name}'s testimonial for ${config.appName}`}
                  />
                ) : (
                  <div className="rounded-lg max-w-[320px] md:max-w-[280px] lg:max-w-[320px] aspect-square bg-base-300 flex items-center justify-center text-6xl font-medium">
                    {testimonial.name.charAt(0)}
                  </div>
                )}
              </div>
            )}

            <div>
              <blockquote className="text-xl font-medium leading-8 text-base-content sm:text-2xl sm:leading-10">
                {testimonial.textReview}
              </blockquote>
              <figcaption className="mt-10 flex items-center justify-start gap-5">
                <div className="text-base">
                  <div className="font-semibold text-base-content mb-0.5">
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
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
};

export default Testimonial;
