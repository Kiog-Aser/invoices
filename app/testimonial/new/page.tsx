"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { FaArrowLeft, FaVideo, FaImage, FaTwitter, FaLinkedin } from "react-icons/fa";

type Step = "welcome" | "personal" | "social" | "profileImage" | "review";

interface FormData {
  name: string;
  socialHandle?: string;
  socialPlatform?: "twitter" | "linkedin";
  profileImage?: string;
  howHelped: string;
  beforeChallenge: string;
  afterSolution: string;
  reviewType?: "text" | "video";
  textReview?: string;
  videoUrl?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  image?: string;
}

const STEPS: Step[] = ["welcome", "personal", "social", "profileImage", "review"];

export default function NewTestimonialPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeInputRef = useRef<HTMLElement | null>(null);

  // Create a type-safe ref setter
  const setActiveRef = useCallback((element: HTMLElement | null) => {
    if (element) {
      activeInputRef.current = element;
    }
  }, []);

  // Load user data on mount and when session changes
  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user?.email) return;

      try {
        setIsLoadingUserData(true);
        const response = await fetch('/api/user', {
          credentials: 'include' // Add this to include auth cookies
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        
        setUserData(data);
        // Pre-fill the form with user data
        setFormData(prev => ({
          ...prev,
          name: data.name || session.user?.name || "",
          profileImage: data.image || session.user?.image || "",
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to session data if API fails
        if (session.user) {
          setFormData(prev => ({
            ...prev,
            name: session.user?.name || "",
            profileImage: session.user?.image || "",
          }));
        }
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserData();
  }, [session]);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case "welcome":
        return true;
      case "personal":
        return !!formData.name;
      case "social":
        return true; // Optional
      case "profileImage":
        return true; // Optional
      case "review":
        return (formData.reviewType === "text" && !!formData.textReview) ||
               (formData.reviewType === "video" && !!formData.videoUrl);
      default:
        return false;
    }
  }, [currentStep, formData]);

  const goToNextStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  }, [currentStep]);

  useEffect(() => {
    // Focus the active input when step changes
    if (activeInputRef.current) {
      activeInputRef.current.focus();
    }

    // Add keyboard navigation with type guards
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      // Allow cmd/ctrl + enter to proceed
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (canProceed()) {
          goToNextStep();
        }
      }
      // Allow enter to proceed on single-line inputs only
      else if (e.key === 'Enter' && 
               target instanceof HTMLInputElement && 
               target.type !== 'textarea' && 
               !target.readOnly && 
               !target.disabled) {
        e.preventDefault();
        if (canProceed()) {
          goToNextStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, formData, goToNextStep, canProceed]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileImage = (url: string) => {
    if (!url) {
      toast.error("Please enter a valid image URL");
      return;
    }
    updateFormData('profileImage', url);
  };

  const handleVideoUrl = (url: string) => {
    if (!url) {
      toast.error("Please enter a valid video URL");
      return;
    }
    // Extract video ID from YouTube/Vimeo URLs
    let videoUrl = url;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        const videoId = url.includes('youtu.be') 
          ? url.split('/').pop() 
          : new URLSearchParams(urlObj.search).get('v');
        if (videoId) {
          videoUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (urlObj.hostname.includes('vimeo.com')) {
        const videoId = url.split('/').pop();
        if (videoId) {
          videoUrl = `https://player.vimeo.com/video/${videoId}`;
        }
      }
    } catch (e) {
      toast.error("Please enter a valid YouTube or Vimeo URL");
      return;
    }
    updateFormData('videoUrl', videoUrl);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Refresh session before making the request
      await fetch('/api/auth/session?update=true', {
        method: 'GET',
        credentials: 'include'
      });

      // Combine howHelped, beforeChallenge, and afterSolution into the review
      let finalReview = "";
      if (formData.reviewType === "text" && formData.howHelped && formData.beforeChallenge && formData.afterSolution) {
        finalReview = `How CreatiFun helped me:\n${formData.howHelped}\n\n` +
                     `Before CreatiFun:\n${formData.beforeChallenge}\n\n` +
                     `After CreatiFun:\n${formData.afterSolution}\n\n` +
                     `${formData.textReview || ""}`;
      }

      // Ensure required fields are present
      const dataToSubmit = {
        ...formData,
        textReview: finalReview || formData.textReview,
        // Add default values for required fields if not provided
        howHelped: formData.howHelped || "Improved website engagement",
        beforeChallenge: formData.beforeChallenge || "Low engagement on website",
        afterSolution: formData.afterSolution || "Better visitor conversion",
      };

      const response = await fetch('/api/testimonial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This sends cookies with the request
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit testimonial' }));
        throw new Error(errorData.error || 'Failed to submit testimonial');
      }

      router.push('/testimonial/thank-you');
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast.error('Failed to submit testimonial');
      setIsSubmitting(false);
    }
  };

  const goToPrevStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold">Share Your Story</h1>
            <p className="text-xl text-base-content/70">
              Help others discover how CreatiFun transforms content creation
            </p>
            <button 
              onClick={() => setCurrentStep("personal")} 
              className="btn btn-primary btn-lg"
              ref={setActiveRef}
            >
              Let's Begin
            </button>
          </div>
        );

      case "personal":
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">What's your name?</h2>
              <p className="text-base-content/70">
                This will appear with your testimonial
              </p>
            </div>
            
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => updateFormData("name", e.target.value)}
              placeholder="Your name"
              className="input input-bordered w-full text-lg"
              ref={setActiveRef}
              autoFocus
            />

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep("welcome")}
                className="btn btn-ghost gap-2"
              >
                <FaArrowLeft /> Back
              </button>
              <button
                onClick={() => setCurrentStep("social")}
                disabled={!formData.name}
                className="btn btn-primary"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case "social":
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Add your social profile</h2>
              <p className="text-base-content/70">
                Optional: Add credibility to your testimonial
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => updateFormData("socialPlatform", "twitter")}
                  className={`btn flex-1 ${formData.socialPlatform === "twitter" ? "btn-primary" : "btn-ghost"}`}
                >
                  <FaTwitter /> X (Twitter)
                </button>
                <button
                  onClick={() => updateFormData("socialPlatform", "linkedin")}
                  className={`btn flex-1 ${formData.socialPlatform === "linkedin" ? "btn-primary" : "btn-ghost"}`}
                >
                  <FaLinkedin /> LinkedIn
                </button>
              </div>

              {formData.socialPlatform && (
                <input
                  type="text"
                  value={formData.socialHandle || ""}
                  onChange={(e) => updateFormData("socialHandle", e.target.value)}
                  placeholder={`Your ${formData.socialPlatform} handle`}
                  className="input input-bordered w-full"
                  ref={setActiveRef}
                  autoFocus
                />
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep("personal")}
                className="btn btn-ghost gap-2"
              >
                <FaArrowLeft /> Back
              </button>
              <button
                onClick={() => setCurrentStep("profileImage")}
                className="btn btn-primary"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case "profileImage":
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Add your profile picture</h2>
              <p className="text-base-content/70">
                Enter the URL of your profile picture (or use your social media profile picture)
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              {formData.profileImage ? (
                <div className="relative group">
                  <Image
                    src={formData.profileImage}
                    alt="Profile preview"
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                  <button
                    onClick={() => updateFormData("profileImage", "")}
                    className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Enter image URL or leave empty to skip"
                  className="input input-bordered w-full"
                  onChange={(e) => handleProfileImage(e.target.value)}
                  ref={setActiveRef}
                  autoFocus
                />
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep("social")}
                className="btn btn-ghost gap-2"
              >
                <FaArrowLeft /> Back
              </button>
              <button
                onClick={() => setCurrentStep("review")}
                className="btn btn-primary"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Choose how to share</h2>
              <p className="text-base-content/70">
                Would you prefer to write a review or record a video?
              </p>
            </div>

            {!formData.reviewType ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => updateFormData("reviewType", "text")}
                  className="card bg-base-200 hover:bg-base-300 transition-colors p-8 text-center"
                  ref={setActiveRef}
                >
                  <div className="text-4xl mb-4">✍️</div>
                  <h3 className="font-bold mb-2">Written Review</h3>
                  <p className="text-sm text-base-content/70">
                    Share your experience in writing
                  </p>
                </button>

                <button
                  onClick={() => updateFormData("reviewType", "video")}
                  className="card bg-base-200 hover:bg-base-300 transition-colors p-8 text-center"
                >
                  <div className="text-4xl mb-4">🎥</div>
                  <h3 className="font-bold mb-2">Video Review</h3>
                  <p className="text-sm text-base-content/70">
                    Record or upload a video testimonial
                  </p>
                </button>
              </div>
            ) : formData.reviewType === "text" ? (
              <div className="space-y-4">
                <p className="text-base-content/70 italic">
                  Based on your answers above, we've prepared some points to help you write your review.
                  Feel free to expand on them or write your own review from scratch.
                </p>
                <textarea
                  value={formData.textReview || ""}
                  onChange={(e) => updateFormData("textReview", e.target.value)}
                  placeholder={`Here's a suggested structure for your review:\n\nBefore using CreatiFun, [describe your content struggles before]\n\nNow, with CreatiFun, [describe how your content creation process has improved and the impact CreatiFun had]\n\n[Optional: add any other details you want to include (like how easy-to-use the platform is, etc)]`}
                  className="textarea textarea-bordered w-full min-h-[200px]"
                  ref={activeInputRef as any}
                  autoFocus
                />

                <div className="flex justify-between">
                  <button
                    onClick={() => updateFormData("reviewType", undefined)}
                    className="btn btn-ghost gap-2"
                  >
                    <FaArrowLeft /> Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.textReview || isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-base-content/70 italic">
                  Share a video from YouTube or Vimeo:
                </p>
                {formData.videoUrl ? (
                  <div className="space-y-4">
                    <iframe
                      src={formData.videoUrl}
                      className="w-full aspect-video rounded-box"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <button
                      className="btn btn-outline w-full"
                      onClick={() => updateFormData("videoUrl", "")}
                    >
                      Change Video
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-base-content/70">
                      Record and upload a short video (1-2 minutes) to YouTube/Vimeo sharing your experience
                    </p>
                    <input
                      type="text"
                      placeholder="Enter YouTube or Vimeo video URL"
                      className="input input-bordered w-full"
                      onChange={(e) => handleVideoUrl(e.target.value)}
                      ref={setActiveRef}
                      autoFocus
                    />
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={() => updateFormData("reviewType", undefined)}
                    className="btn btn-ghost gap-2"
                  >
                    <FaArrowLeft /> Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.videoUrl || isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-base-100 flex flex-col">
      {/* Progress indicator */}
      <div className="h-1 bg-base-200">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((STEPS.indexOf(currentStep) + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg mx-auto"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 right-4 text-sm text-base-content/40">
        Press <kbd className="kbd kbd-sm">Enter</kbd> or <kbd className="kbd kbd-sm">⌘</kbd> + <kbd className="kbd kbd-sm">Enter</kbd> to continue
      </div>
    </main>
  );
}