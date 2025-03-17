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

// A one or two sentence testimonial from a customer.
const Testimonial1Small = () => {
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) throw new Error('Failed to fetch testimonials');
        const data = await response.json();
        // Use the first testimonial that is short enough
        const shortTestimonial = data.find((t: Testimonial) => 
          t.textReview && t.textReview.split(' ').length < 100
        );
        if (shortTestimonial) {
          setTestimonial(shortTestimonial);
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
      <section className="bg-base-100">
        <div className="space-y-6 md:space-y-8 max-w-lg mx-auto px-8 py-16 md:py-32 flex justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </section>
    );
  }

  if (!testimonial) return null;

  return (
    <section className="bg-base-100">
      <div className="space-y-6 md:space-y-8 max-w-lg mx-auto px-8 py-16 md:py-32">
        <div className="rating !flex justify-center">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-warning"
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </div>

        <div className="text-base leading-relaxed space-y-2 max-w-md mx-auto text-center">
          <p className="whitespace-pre-wrap text-base-content/80">
            {testimonial.textReview}
          </p>
        </div>

        <div className="flex justify-center items-center gap-3 md:gap-4">
          {testimonial.profileImage ? (
            <Image
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
              src={testimonial.profileImage}
              alt={`${testimonial.name}'s testimonial for ${config.appName}`}
              width={48}
              height={48}
            />
          ) : (
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-base-300 flex items-center justify-center text-lg font-medium">
              {testimonial.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold">{testimonial.name}</p>
            {testimonial.socialHandle && (
              <p className="text-base-content/80 text-sm">
                @{testimonial.socialHandle} on {testimonial.socialPlatform}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial1Small;
