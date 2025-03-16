"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { FaArrowLeft, FaVideo, FaImage, FaTwitter, FaLinkedin } from "react-icons/fa";
import { ITestimonial } from "@/models/Testimonial";

type Step = "welcome" | "personal" | "social" | "profileImage" | "impact" | "review";
type FormData = Omit<ITestimonial, "userId" | "status" | "createdAt" | "updatedAt">;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

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

  const updateFormData = (field: keyof FormData, value: any) => {
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

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Upload failed');
        }
        
        const { url } = await response.json();
        updateFormData('profileImage', url);
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

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Upload failed');
        }
        
        const { url } = await response.json();
        updateFormData('videoUrl', url);
      } catch (error) {
        console.error('Error uploading video:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to upload video');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
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
            >
              Let's Begin
            </button>
          </div>
        );

      case "personal":
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Tell us about yourself</h2>
              <p className="text-base-content/70">
                This information will appear with your testimonial
              </p>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Your name</span>
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="John Smith"
                className="input input-bordered"
              />
            </div>

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
                onClick={() => setCurrentStep("impact")}
                className="btn btn-primary"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case "impact":
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Your NotiFast Experience</h2>
              <p className="text-base-content/70">
                Tell us how NotiFast helped your business
              </p>
            </div>

            <div className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">How has NotiFast helped you?</span>
                </label>
                <textarea
                  value={formData.howHelped || ""}
                  onChange={(e) => updateFormData("howHelped", e.target.value)}
                  placeholder="NotiFast helped me..."
                  className="textarea textarea-bordered min-h-[100px]"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">What was challenging before NotiFast?</span>
                </label>
                <textarea
                  value={formData.beforeChallenge || ""}
                  onChange={(e) => updateFormData("beforeChallenge", e.target.value)}
                  placeholder="Before NotiFast..."
                  className="textarea textarea-bordered min-h-[100px]"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">How has NotiFast solved this?</span>
                </label>
                <textarea
                  value={formData.afterSolution || ""}
                  onChange={(e) => updateFormData("afterSolution", e.target.value)}
                  placeholder="Now with NotiFast..."
                  className="textarea textarea-bordered min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep("profileImage")}
                className="btn btn-ghost gap-2"
              >
                <FaArrowLeft /> Back
              </button>
              <button
                onClick={() => setCurrentStep("review")}
                disabled={!formData.howHelped || !formData.beforeChallenge || !formData.afterSolution}
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
                <textarea
                  value={formData.textReview || ""}
                  onChange={(e) => updateFormData("textReview", e.target.value)}
                  placeholder="Share your experience with NotiFast..."
                  className="textarea textarea-bordered w-full min-h-[200px]"
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
    <main className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-12">
        {/* Progress indicator */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="flex justify-between">
            {["welcome", "personal", "social", "profileImage", "impact", "review"].map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${currentStep === step ? "text-primary" : "text-base-content/40"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? "bg-primary text-primary-content"
                      : step === "welcome"
                      ? "bg-base-content/20"
                      : "bg-base-200"
                  }`}
                >
                  {index + 1}
                </div>
                {index < 5 && (
                  <div
                    className={`w-full h-1 ${
                      index < ["welcome", "personal", "social", "profileImage", "impact", "review"].indexOf(currentStep)
                        ? "bg-base-content/20"
                        : "bg-base-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-xl mx-auto"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}