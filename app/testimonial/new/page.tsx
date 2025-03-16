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

// Add a more specific ref type
type ActiveInputRefType = HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const STEPS: Step[] = ["welcome", "personal", "social", "profileImage", "review"];

export default function NewTestimonialPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [formData, setFormData] = useState<Partial<FormData>>({
    name: session?.user?.name || "",
    profileImage: session?.user?.image || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Use MutableRefObject for a ref we want to update
  const activeInputRef = useRef<HTMLElement | null>(null);

  // Create a type-safe ref setter
  const setActiveRef = useCallback((element: HTMLElement | null) => {
    if (element) {
      activeInputRef.current = element;
    }
  }, []);

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

  const validateFile = (file: File, type: 'image' | 'video') => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File must be less than 5MB`);
      return false;
    }

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm'];
    const validTypes = type === 'video' ? validVideoTypes : validImageTypes;

    if (!validTypes.includes(file.type)) {
      toast.error(`Invalid file type. Must be ${type === 'video' ? 'MP4 or WebM' : 'JPEG, PNG, GIF or WebP'}`);
      return false;
    }

    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file, 'image')) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');
        
        const response = await fetch('/api/testimonial/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }
        
        updateFormData('profileImage', data.url);
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file, 'video')) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'video');
        
        const response = await fetch('/api/testimonial/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }
        
        updateFormData('videoUrl', data.url);
      } catch (error) {
        console.error('Error uploading video:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to upload video');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Combine howHelped, beforeChallenge, and afterSolution into the review
      let finalReview = "";
      if (formData.reviewType === "text" && formData.howHelped && formData.beforeChallenge && formData.afterSolution) {
        finalReview = `How NotiFast helped me:\n${formData.howHelped}\n\n` +
                     `Before NotiFast:\n${formData.beforeChallenge}\n\n` +
                     `After NotiFast:\n${formData.afterSolution}\n\n` +
                     `${formData.textReview || ""}`;
        updateFormData("textReview", finalReview);
      }

      const response = await fetch('/api/testimonial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit testimonial');
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
              Help others discover how NotiFast transformed your website engagement
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
                  <FaTwitter /> Twitter
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
                This will appear alongside your testimonial
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
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-outline btn-lg gap-2"
                  ref={setActiveRef}
                >
                  <FaImage /> Choose Image
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
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
                  placeholder={`Here's a suggested structure for your review:\n\n ""}\n\nBefore using NotiFast, [describe your situation before]\n\nNow, with NotiFast, [describe how your situation has improved and the impact NotiFast had]\n\n[Optional: add any other details you want to include (like how easy-to-use the platform is, etc)]`}
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
                  Consider including these points in your video:
                </p>
                <ul className="list-disc list-inside space-y-2 text-base-content/70">
                  <li>{formData.howHelped || ""}</li>
                  <li>Before: {formData.beforeChallenge || ""}</li>
                  <li>After: {formData.afterSolution || ""}</li>
                </ul>

                {formData.videoUrl ? (
                  <div className="space-y-4">
                    <video
                      src={formData.videoUrl}
                      controls
                      className="w-full aspect-video rounded-box"
                    />
                    <button
                      className="btn btn-outline w-full"
                      onClick={() => {
                        updateFormData("videoUrl", undefined);
                        const videoInput = document.createElement('input');
                        videoInput.type = 'file';
                        videoInput.accept = 'video/*';
                        videoInput.onchange = (e) => handleVideoUpload(e as any);
                        videoInput.click();
                      }}
                    >
                      Choose Another Video
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-base-content/70">
                      Record a short video (1-2 minutes) sharing your experience
                    </p>
                    <button
                      className="btn btn-primary gap-2"
                      onClick={() => {
                        const videoInput = document.createElement('input');
                        videoInput.type = 'file';
                        videoInput.accept = 'video/*';
                        videoInput.onchange = (e) => handleVideoUpload(e as any);
                        videoInput.click();
                      }}
                      ref={setActiveRef}
                    >
                      <FaVideo /> Upload Video
                    </button>
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