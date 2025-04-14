"use client";

// Ensure this page is rendered dynamically at request time
export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";

// Custom hook for localStorage persistence with form data
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  };

  return [storedValue, setValue];
}

// Define step types for our typeform-style form
type Step =
  | "title"
  | "role"
  | "industry"
  | "experience"        
  | "audience"          
  | "timeAvailability"  
  | "onlinePresence"    
  | "platformSelection" 
  | "platformDetails"   
  | "contentTypes"
  | "goals"
  | "challenges"
  | "leadMagnets"       
  | "offers"            
  | "contentSample"     
  | "contentBalance"    
  | "processing";

interface FormData {
  title: string;
  userRole: string;
  industry: string;
  contentTypes: string[];
  goals: string;
  challenges: string;
  customContentTypes: string[];
  modelType: 'quality'; // Default to quality (deepseek)
  experience: string;
  audience: string[];
  audienceDetails: string;
  idealClientProfiles: { description: string }[];
  timeAvailability: string;
  onlinePresence: {
    platforms: string[];
    platformDetails: Record<string, {
      followersCount: string;
      postFrequency: string;
    }>;
  };
  contentBalance: 'education' | 'conversion' | 'balanced';
  contentSample: string;
  hasLeadMagnets: boolean;
  leadMagnets: string[];
  leadMagnetDetails: string;
  hasOffers: boolean;
  offers: string[];
  offerDetails: string;
}

type PlatformDetail = {
  metricName: string;
  ranges: string[];
};

const platformDetails: Record<string, PlatformDetail> = {
  "Website/Blog": {
    metricName: "Monthly visitors",
    ranges: [
      "Under 1,000",
      "1,000-10,000", 
      "10,000-50,000", 
      "50,000-100,000", 
      "100,000+"
    ]
  },
  "LinkedIn": {
    metricName: "Connections/Followers",
    ranges: [
      "Under 500", 
      "500-1,000", 
      "1,000-5,000", 
      "5,000-10,000", 
      "10,000+"
    ]
  },
  "Twitter/X": {
    metricName: "Followers",
    ranges: [
      "Under 500", 
      "500-1,000", 
      "1,000-5,000", 
      "5,000-10,000", 
      "10,000-50,000", 
      "50,000+"
    ]
  },
  "Instagram": {
    metricName: "Followers",
    ranges: [
      "Under 1,000", 
      "1,000-5,000", 
      "5,000-10,000", 
      "10,000-50,000", 
      "50,000-100,000", 
      "100,000+"
    ]
  },
  "Facebook": {
    metricName: "Page/Group followers",
    ranges: [
      "Under 500", 
      "500-1,000", 
      "1,000-5,000", 
      "5,000-10,000", 
      "10,000-50,000", 
      "50,000+"
    ]
  },
  "YouTube": {
    metricName: "Subscribers",
    ranges: [
      "Under 100", 
      "100-1,000", 
      "1,000-10,000", 
      "10,000-100,000", 
      "100,000+"
    ]
  },
  "TikTok": {
    metricName: "Followers",
    ranges: [
      "Under 1,000", 
      "1,000-5,000", 
      "5,000-20,000", 
      "20,000-100,000", 
      "100,000+"
    ]
  },
  "Medium": {
    metricName: "Followers",
    ranges: [
      "Under 100", 
      "100-500", 
      "500-1,000", 
      "1,000-5,000", 
      "5,000+"
    ]
  },
  "Substack": {
    metricName: "Subscribers",
    ranges: [
      "Under 100", 
      "100-500", 
      "500-1,000", 
      "1,000-5,000", 
      "5,000+"
    ]
  },
  "Pinterest": {
    metricName: "Followers",
    ranges: [
      "Under 500", 
      "500-1,000", 
      "1,000-5,000", 
      "5,000-10,000", 
      "10,000+"
    ]
  },
  "Podcast": {
    metricName: "Listeners per episode",
    ranges: [
      "Under 100", 
      "100-500", 
      "500-1,000", 
      "1,000-5,000", 
      "5,000+"
    ]
  }
};

export default function CreateWritingProtocolPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useLocalStorage<Step>("writingProtocolCurrentStep", "title");
  const [formData, setFormData] = useLocalStorage<FormData>("writingProtocolFormData", {
    title: "",
    userRole: "",
    industry: "",
    contentTypes: [],
    goals: "",
    challenges: "",
    customContentTypes: [],
    modelType: 'quality', // Default to deepseek
    experience: "",
    audience: [],
    audienceDetails: "",
    idealClientProfiles: [],
    timeAvailability: "",
    onlinePresence: {
      platforms: [],
      platformDetails: {},
    },
    contentBalance: 'balanced',
    contentSample: "",
    hasLeadMagnets: false,
    leadMagnets: [],
    leadMagnetDetails: "",
    hasOffers: false,
    offers: [],
    offerDetails: "",
  });

  const [hasProtocolAccess, setHasProtocolAccess] = useState(true);
  const [accessDetails, setAccessDetails] = useState<{
    isUnlimited: boolean;
    tokens: number;
  }>({ isUnlimited: false, tokens: 0 });

  const [newCustomContentType, setNewCustomContentType] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(
    null,
  );

  const [protocolId, setProtocolId] = useState<string | null>(null);
  const [processingTimePassed, setProcessingTimePassed] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const contentTypeOptions = [
    "Blog posts",
    "Social media content",
    "Email newsletters",
    "Long-form articles",
    "Technical documentation",
    "Marketing copy",
    "Fiction writing",
    "Academic papers",
    "Reports",
    "Website content",
  ];

  const goalOptions = [
    "Improve writing speed",
    "Enhance quality",
    "Maintain consistency",
    "Reduce writer's block",
    "Better organization",
    "Streamline editing process",
    "Increase productivity",
    "Improve SEO performance",
    "More engaging content",
    "Maintain brand voice",
  ];

  const challengeOptions = [
    "Procrastination",
    "Writer's block",
    "Inconsistent quality",
    "Time management",
    "Organization",
    "Editing efficiently",
    "Research process",
    "Maintaining focus",
    "Creating engaging content",
    "Finding inspiration",
  ];

  const experienceLevelOptions = [
    "Beginner (0-1 years)",
    "Intermediate (1-3 years)",
    "Advanced (3-5 years)",
    "Expert (5+ years)"
  ];

  const timeAvailabilityOptions = [
    "Very limited (1-2 hours/week)",
    "Limited (3-5 hours/week)",
    "Moderate (5-10 hours/week)",
    "Significant (10-20 hours/week)",
    "Full-time (20+ hours/week)"
  ];

  const frequencyOptions = [
    "Rarely (less than once per month)",
    "Occasionally (1-3 times per month)",
    "Regularly (1-2 times per week)",
    "Frequently (3-5 times per week)",
    "Daily",
    "Multiple times per day"
  ];

  const followerRangeOptions = [
    "Just starting (<100 followers)",
    "Small audience (100-1,000 followers)",
    "Growing audience (1,000-10,000 followers)",
    "Established audience (10,000-50,000 followers)",
    "Large audience (50,000-100,000 followers)",
    "Very large audience (100,000+ followers)"
  ];

  const leadMagnetOptions = [
    "PDF guide or ebook",
    "Email course or challenge",
    "Free template or worksheet",
    "Webinar or workshop",
    "Quiz or assessment",
    "Free consultation or coaching call",
    "Resource library or toolkit",
    "Free trial or demo",
    "Checklist",
    "Video tutorial"
  ];
  
  const offerOptions = [
    "Digital product (course, ebook, etc.)",
    "Coaching or consulting services",
    "Membership or subscription",
    "Physical product",
    "Software as a service (SaaS)",
    "Done-for-you service",
    "Group program",
    "Masterclass or workshop",
    "Custom solution"
  ];

  const [currentPlatformIndex, setCurrentPlatformIndex] = useState<number>(0);

  useEffect(() => {
    if (!formData.idealClientProfiles || !formData.idealClientProfiles.length) {
      setFormData(prev => ({
        ...prev,
        idealClientProfiles: [{ description: "" }]
      }));
    }
  }, []);

  const clearSavedFormData = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem('writingProtocolFormData');
      window.localStorage.removeItem('writingProtocolCurrentStep');
    }
  };

  useEffect(() => {
    if (activeInputRef.current) {
      activeInputRef.current.focus();
    }
  }, [currentStep]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      checkProtocolAccess();
    }
  }, [status, router]);

  const checkProtocolAccess = async () => {
    try {
      const response = await fetch('/api/user/protocol-access');
      if (!response.ok) {
        throw new Error('Failed to check protocol access');
      }
      
      const data = await response.json();
      setHasProtocolAccess(data.hasAccess);
      setAccessDetails({
        isUnlimited: data.isUnlimited,
        tokens: data.remainingTokens,
      });
      
      if (!data.hasAccess) {
        toast.error('You need to purchase access to create protocols');
        setTimeout(() => router.push('/#pricing'), 1500);
      }
    } catch (error) {
      console.error('Error checking protocol access:', error);
      toast.error('Failed to verify protocol access');
    }
  };

  const updateFormData = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case "title":
        return !!formData.title && formData.title.trim().length >= 3;
      case "role":
        return !!formData.userRole && formData.userRole.trim().length >= 3;
      case "industry":
        return !!formData.industry && formData.industry.trim().length >= 3;
      case "contentTypes":
        return formData.contentTypes.length > 0;
      case "goals":
        return !!formData.goals && typeof formData.goals === 'string' && formData.goals.trim().length > 0;
      case "challenges":
        return !!formData.challenges && typeof formData.challenges === 'string' && formData.challenges.trim().length > 0;
      case "experience":
        return !!formData.experience;
      case "audience":
        return formData.idealClientProfiles.length > 0 && 
               formData.idealClientProfiles.some(profile => profile.description.trim().length > 0);
      case "timeAvailability":
        return !!formData.timeAvailability;
      case "onlinePresence":
        return true;
      case "platformSelection":
        return formData.onlinePresence.platforms.length > 0;
      case "platformDetails":
        return true;
      case "leadMagnets":
        return true; // Always allow proceeding regardless of selection
      case "offers":
        return true; // Always allow proceeding regardless of selection
      case "contentSample":
        return true;
      case "contentBalance":
        return !!formData.contentBalance;
      default:
        return false;
    }
  };

  const goToNextStep = () => {
    if (!canProceed()) return;

    switch (currentStep) {
      case "title":
        setCurrentStep("role");
        break;
      case "role":
        setCurrentStep("industry");
        break;
      case "industry":
        setCurrentStep("experience");
        break;
      case "experience":
        setCurrentStep("audience");
        break;
      case "audience":
        setCurrentStep("timeAvailability");
        break;
      case "timeAvailability":
        setCurrentStep("onlinePresence");
        break;
      case "onlinePresence":
        if (formData.onlinePresence.platforms.length === 0) {
          setCurrentStep("contentTypes");
        } else {
          setCurrentStep("platformSelection");
        }
        break;
      case "platformSelection":
        setCurrentPlatformIndex(0);
        setCurrentStep("platformDetails");
        break;
      case "platformDetails":
        if (currentPlatformIndex < formData.onlinePresence.platforms.length - 1) {
          setCurrentPlatformIndex(currentPlatformIndex + 1);
        } else {
          setCurrentStep("contentTypes");
        }
        break;
      case "contentTypes":
        setCurrentStep("goals");
        break;
      case "goals":
        setCurrentStep("challenges");
        break;
      case "challenges":
        setCurrentStep("leadMagnets");
        break;
      case "leadMagnets":
        setCurrentStep("offers");
        break;
      case "offers":
        setCurrentStep("contentSample");
        break;
      case "contentSample":
        setCurrentStep("contentBalance");
        break;
      case "contentBalance":
        setCurrentStep("processing");
        handleSubmit();
        break;
      default:
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case "role":
        setCurrentStep("title");
        break;
      case "industry":
        setCurrentStep("role");
        break;
      case "experience":
        setCurrentStep("industry");
        break;
      case "audience":
        setCurrentStep("experience");
        break;
      case "timeAvailability":
        setCurrentStep("audience");
        break;
      case "onlinePresence":
        setCurrentStep("timeAvailability");
        break;
      case "platformSelection":
        setCurrentStep("onlinePresence");
        break;
      case "platformDetails":
        if (currentPlatformIndex > 0) {
          setCurrentPlatformIndex(currentPlatformIndex - 1);
        } else {
          setCurrentStep("platformSelection");
        }
        break;
      case "contentTypes":
        if (formData.onlinePresence.platforms.length > 0) {
          setCurrentPlatformIndex(formData.onlinePresence.platforms.length - 1);
          setCurrentStep("platformDetails");
        } else {
          setCurrentStep("onlinePresence");
        }
        break;
      case "goals":
        setCurrentStep("contentTypes");
        break;
      case "challenges":
        setCurrentStep("goals");
        break;
      case "leadMagnets":
        setCurrentStep("challenges");
        break;
      case "offers":
        setCurrentStep("leadMagnets");
        break;
      case "contentSample":
        setCurrentStep("offers");
        break;
      case "contentBalance":
        setCurrentStep("contentSample");
        break;
      case "processing":
        setCurrentStep("contentBalance");
        break;
      default:
        break;
    }
  };

  const toggleArrayValue = (array: string[], value: string): string[] => {
    if (array.includes(value)) {
      return array.filter((item) => item !== value);
    } else {
      return [...array, value];
    }
  };

  const addCustomOption = (
    category: 'contentTypes',
    value: string
  ) => {
    if (!value.trim()) return;
    
    const customFieldName = `custom${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof FormData;
    const newCustomValues = [...(formData[customFieldName] as string[]), value.trim()];
    updateFormData(customFieldName, newCustomValues);
    
    switch(category) {
      case 'contentTypes':
        setNewCustomContentType('');
        break;
    }
  };

  const removeCustomOption = (
    category: 'contentTypes',
    index: number
  ) => {
    const customFieldName = `custom${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof FormData;
    const newCustomValues = [...(formData[customFieldName] as string[])];
    newCustomValues.splice(index, 1);
    updateFormData(customFieldName, newCustomValues);
  };

  const handleSubmit = async () => {
    try {
      const accessResponse = await fetch('/api/user/protocol-access');
      if (!accessResponse.ok) {
        throw new Error('Failed to verify protocol access');
      }
      
      const accessData = await accessResponse.json();
      if (!accessData.hasAccess) {
        toast.error('You need to purchase access to create protocols');
        router.push('/#pricing');
        return;
      }
      
      setIsProcessing(true);
      toast.loading("Creating your writing protocol (this may take 2-3 minutes)...");

      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }

      const submissionData = {
        ...formData,
        contentTypes: formData.contentTypes.includes("Other") 
          ? [...formData.contentTypes.filter(type => type !== "Other"), ...formData.customContentTypes]
          : formData.contentTypes,
        // Goals and challenges are already strings, so we don't need to filter them
        goals: formData.goals,
        challenges: formData.challenges,
      };

      const response = await fetch("/api/writing-protocol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create writing protocol";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!accessData.isUnlimited) {
        const consumeResponse = await fetch('/api/user/consume-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!consumeResponse.ok) {
          console.error('Failed to consume token, but protocol was created');
        }
      }

      toast.dismiss();
      toast.loading(
        `Your protocol is being generated (this may take 2-3 minutes)...`, 
        { duration: 60000 }
      );

      if (result && result._id) {
        setProtocolId(result._id);
        startPolling(result._id);
        clearSavedFormData();
      } else {
        throw new Error("Failed to create protocol. No ID returned.");
      }
    } catch (error) {
      console.error("Error creating writing protocol:", error);
      toast.dismiss();
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create writing protocol",
      );
      setCurrentStep("contentSample");
      setIsProcessing(false);
    }
  };

  const startPolling = (id: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        setProcessingTimePassed(prev => prev + 3);
        
        const response = await fetch(`/api/writing-protocol?id=${id}`, {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch protocol status');
        }

        const protocol = await response.json();
        
        if (protocol.status === 'completed' || protocol.status === 'failed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }

          if (protocol.status === 'completed') {
            toast.dismiss();
            toast.success('Your writing protocol is ready!');
            router.push(`/dashboard/${id}`);
          } else if (protocol.status === 'failed') {
            toast.dismiss();
            toast.error(protocol.statusMessage || 'Failed to generate protocol. Please try again.');
            setCurrentStep('contentSample');
            setIsProcessing(false);
          }
        }
      } catch (error) {
        console.error("Error polling protocol status:", error);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "TEXTAREA" || e.ctrlKey) {
          e.preventDefault();
          if (canProceed()) {
            goToNextStep();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, formData]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <div className="fixed top-0 left-0 w-full h-1 bg-base-200 z-10">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{
            width: `${(STEPS.indexOf(currentStep) + 1) * (100 / STEPS.length)}%`,
          }}
        ></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-base-100 rounded-xl p-8"
            >
              {currentStep === "title" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">
                    Name your writing protocol
                  </h1>
                  <p className="text-base-content/70">
                    This helps you identify this protocol later.
                  </p>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    placeholder="E.g., Blog Writing System, Email Newsletter Protocol..."
                    className="input input-bordered w-full text-lg"
                    ref={(el) => {
                      activeInputRef.current = el;
                    }}
                  />
                </div>
              )}



              {currentStep === "role" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">What's your role?</h1>
                  <p className="text-base-content/70">
                    Understanding your role helps tailor the protocol to your
                    needs.
                  </p>
                  <input
                    type="text"
                    value={formData.userRole}
                    onChange={(e) => updateFormData("userRole", e.target.value)}
                    placeholder="E.g., Content Marketer, Technical Writer, Blogger..."
                    className="input input-bordered w-full text-lg"
                    ref={(el) => {
                      activeInputRef.current = el;
                    }}
                  />
                </div>
              )}

              {currentStep === "industry" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">
                    What industry do you write for?
                  </h1>
                  <p className="text-base-content/70">
                    Different industries have different writing conventions.
                  </p>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => updateFormData("industry", e.target.value)}
                    placeholder="E.g., Technology, Healthcare, Finance..."
                    className="input input-bordered w-full text-lg"
                    ref={(el) => {
                      activeInputRef.current = el;
                    }}
                  />
                </div>
              )}

              {currentStep === "experience" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">
                    What is your experience level?
                  </h1>
                  <p className="text-base-content/70">
                    This helps us tailor the protocol to your expertise.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {experienceLevelOptions.map((option) => (
                      <label
                        key={option}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                          formData.experience === option ? "border-primary border-2" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          className="radio radio-primary mr-3"
                          checked={formData.experience === option}
                          onChange={() => updateFormData("experience", option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === "audience" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">
                    Who is your target audience?
                  </h1>
                  <p className="text-base-content/70">
                    Describe your ideal clients/readers to help us create more personalized content.
                  </p>
                  
                  <div className="mt-2">
                    
                    {formData.idealClientProfiles.map((profile, index) => (
                      <div key={index} className="mb-4 bg-base-200 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Profile #{index + 1}</h3>
                          <button 
                            className="btn btn-sm btn-ghost" 
                            onClick={() => {
                              const updatedProfiles = [...formData.idealClientProfiles];
                              updatedProfiles.splice(index, 1);
                              updateFormData("idealClientProfiles", updatedProfiles);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                        <textarea
                          placeholder={`Describe your ideal client/reader. What are their demographics, pain points, desires, objections, and where are they in their journey?`}
                          className="textarea textarea-bordered w-full h-24"
                          value={profile.description}
                          onChange={(e) => {
                            const updatedProfiles = [...formData.idealClientProfiles];
                            updatedProfiles[index].description = e.target.value;
                            updateFormData("idealClientProfiles", updatedProfiles);
                          }}
                          ref={index === 0 ? (el) => {
                            activeInputRef.current = el;
                          } : undefined}
                        ></textarea>
                      </div>
                    ))}
                    
                    {formData.idealClientProfiles.length < 3 && (
                      <button 
                        className="btn btn-outline btn-primary btn-sm mt-2" 
                        onClick={() => {
                          const updatedProfiles = [...formData.idealClientProfiles, { description: "" }];
                          updateFormData("idealClientProfiles", updatedProfiles);
                        }}
                      >
                        + Add another profile
                      </button>
                    )}
                    
                    <div className="bg-base-200/50 p-4 rounded-lg mt-6">
                      <div className="flex items-start mb-2">
                        <span className="text-xl mr-2">💡</span>
                        <h3 className="font-semibold">Example Profile</h3>
                      </div>
                      <p className="text-sm text-base-content/80">
                        "Sarah, 38, marketing director at a mid-sized B2B company. She's overwhelmed with managing multiple marketing channels and needs systems to make content creation more efficient. She has a good marketing foundation but struggles with content consistency. She values data-driven approaches and practical strategies she can implement right away."
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === "timeAvailability" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">
                    How much time can you dedicate to content creation?
                  </h1>
                  <p className="text-base-content/70">
                    This will help tailor the protocol to a realistic schedule for you.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {timeAvailabilityOptions.map((option) => (
                      <label
                        key={option}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                          formData.timeAvailability === option ? "border-primary border-2" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          className="radio radio-primary mr-3"
                          checked={formData.timeAvailability === option}
                          onChange={() => updateFormData("timeAvailability", option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === "onlinePresence" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">
                    Do you already have an online presence?
                  </h1>
                  <p className="text-base-content/70">
                    Select "Yes" if you already create content on any platform.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <label
                      className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                        formData.onlinePresence.platforms.length > 0 ? "border-primary border-2" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        className="radio radio-primary mr-3"
                        checked={formData.onlinePresence.platforms.length > 0}
                        onChange={() => {
                          updateFormData("onlinePresence", {
                            platforms: ["Website/Blog"],
                            platformDetails: {}
                          });
                          setCurrentStep("platformSelection");
                        }}
                      />
                      <span>Yes</span>
                    </label>
                    
                    <label
                      className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                        formData.onlinePresence.platforms.length === 0 ? "border-primary border-2" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        className="radio radio-primary mr-3"
                        checked={formData.onlinePresence.platforms.length === 0}
                        onChange={() => {
                          updateFormData("onlinePresence", {
                            platforms: [],
                            platformDetails: {}
                          });
                          setCurrentStep("contentTypes");
                        }}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              )}

              {currentStep === "platformSelection" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">
                    Select the platforms you use
                  </h1>
                  <p className="text-base-content/70 mb-4">
                    Choose all platforms where you currently create content.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.keys(platformDetails).map((platform) => (
                      <label
                        key={platform}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                          formData.onlinePresence.platforms.includes(platform) ? "border-primary border-2" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary mr-3"
                          checked={formData.onlinePresence.platforms.includes(platform)}
                          onChange={() => {
                            let currentPlatforms = formData.onlinePresence.platforms;
                            if (currentPlatforms.length === 1 && currentPlatforms[0] === "Website/Blog" && platform !== "Website/Blog") {
                              currentPlatforms = [];
                            }
                            
                            const updatedPlatforms = toggleArrayValue(
                              currentPlatforms,
                              platform
                            );
                            
                            const updatedPlatformDetails = { ...formData.onlinePresence.platformDetails };
                            
                            if (!currentPlatforms.includes(platform) && updatedPlatforms.includes(platform)) {
                              updatedPlatformDetails[platform] = {
                                followersCount: platformDetails[platform]?.ranges[0] || "",
                                postFrequency: frequencyOptions[0]
                              };
                            }
                            
                            if (currentPlatforms.includes(platform) && !updatedPlatforms.includes(platform)) {
                              delete updatedPlatformDetails[platform];
                            }
                            
                            updateFormData("onlinePresence", {
                              platforms: updatedPlatforms,
                              platformDetails: updatedPlatformDetails
                            });
                          }}
                        />
                        <span>{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === "platformDetails" && (
                <div className="space-y-6">
                  {formData.onlinePresence.platforms.length > currentPlatformIndex && (
                    <>
                      <h1 className="text-3xl font-bold">
                        Tell us about your {formData.onlinePresence.platforms[currentPlatformIndex]} presence
                      </h1>
                      <p className="text-base-content/70">
                        This helps us tailor your protocol to your existing audience and content strategy.
                      </p>
                      
                      <div className="space-y-8 mt-6">
                        <div className="space-y-3">
                          <label className="font-medium">
                            {platformDetails[formData.onlinePresence.platforms[currentPlatformIndex]]?.metricName || "Audience size"}
                          </label>
                          
                          <div className="flex flex-col space-y-4">
                            <input 
                              type="range" 
                              className="range range-primary" 
                              min="0" 
                              max={(platformDetails[formData.onlinePresence.platforms[currentPlatformIndex]]?.ranges?.length || 1) - 1} 
                              step="1"
                              value={platformDetails[formData.onlinePresence.platforms[currentPlatformIndex]]?.ranges?.indexOf(
                                formData.onlinePresence.platformDetails[formData.onlinePresence.platforms[currentPlatformIndex]]?.followersCount || 
                                (platformDetails[formData.onlinePresence.platforms[currentPlatformIndex]]?.ranges?.[0] || "")
                              ) || 0}
                              onChange={(e) => {
                                const platform = formData.onlinePresence.platforms[currentPlatformIndex];
                                const rangeIndex = parseInt(e.target.value);
                                const value = platformDetails[platform]?.ranges?.[rangeIndex] || "";
                                
                                const updatedPlatformDetails = {
                                  ...formData.onlinePresence.platformDetails,
                                  [platform]: {
                                    ...(formData.onlinePresence.platformDetails[platform] || {}),
                                    followersCount: value
                                  }
                                };
                                
                                updateFormData("onlinePresence", {
                                  ...formData.onlinePresence,
                                  platformDetails: updatedPlatformDetails
                                });
                              }}
                            />
                            
                            <div className="flex justify-between px-2 text-xs text-base-content/70">
                              {platformDetails[formData.onlinePresence.platforms[currentPlatformIndex]]?.ranges?.map((range, index) => (
                                <span key={index} className={
                                  formData.onlinePresence.platformDetails[formData.onlinePresence.platforms[currentPlatformIndex]]?.followersCount === range 
                                  ? "font-bold text-primary" 
                                  : ""
                                }>
                                  {index === 0 || index === (platformDetails[formData.onlinePresence.platforms[currentPlatformIndex]]?.ranges?.length || 1) - 1 ? range : ""}
                                </span>
                              ))}
                            </div>
                            
                            <div className="text-center font-medium">
                              {formData.onlinePresence.platformDetails[formData.onlinePresence.platforms[currentPlatformIndex]]?.followersCount || 
                              (platformDetails[formData.onlinePresence.platforms[currentPlatformIndex]]?.ranges?.[0] || "")}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <label className="font-medium">Posting Frequency</label>
                          
                          <div className="flex flex-col space-y-4">
                            <input 
                              type="range" 
                              className="range range-primary" 
                              min="0" 
                              max={frequencyOptions.length - 1} 
                              step="1"
                              value={frequencyOptions.indexOf(
                                formData.onlinePresence.platformDetails[formData.onlinePresence.platforms[currentPlatformIndex]]?.postFrequency || 
                                frequencyOptions[0]
                              ) || 0}
                              onChange={(e) => {
                                const platform = formData.onlinePresence.platforms[currentPlatformIndex];
                                const rangeIndex = parseInt(e.target.value);
                                const value = frequencyOptions[rangeIndex];
                                
                                const updatedPlatformDetails = {
                                  ...formData.onlinePresence.platformDetails,
                                  [platform]: {
                                    ...(formData.onlinePresence.platformDetails[platform] || {}),
                                    postFrequency: value
                                  }
                                };
                                
                                updateFormData("onlinePresence", {
                                  ...formData.onlinePresence,
                                  platformDetails: updatedPlatformDetails
                                });
                              }}
                            />
                            
                            <div className="flex justify-between px-2 text-xs text-base-content/70">
                              {frequencyOptions.map((option, index) => (
                                <span key={index} className={
                                  formData.onlinePresence.platformDetails[formData.onlinePresence.platforms[currentPlatformIndex]]?.postFrequency === option
                                  ? "font-bold text-primary" 
                                  : ""
                                }>
                                  {index === 0 || index === frequencyOptions.length - 1 ? option.split(' ')[0] : ""}
                                </span>
                              ))}
                            </div>
                            
                            <div className="text-center font-medium">
                              {formData.onlinePresence.platformDetails[formData.onlinePresence.platforms[currentPlatformIndex]]?.postFrequency || frequencyOptions[0]}
                            </div>
                          </div>
                        </div>

                        <div className="text-center mt-6">
                          <p className="text-sm text-base-content/70">
                            {currentPlatformIndex + 1} of {formData.onlinePresence.platforms.length} platforms
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {currentStep === "contentTypes" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">
                    What type of content do you write?
                  </h1>
                  <p className="text-base-content/70">
                    Select all that apply. Your protocol will include strategies
                    for each content type.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {contentTypeOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary mr-3"
                          checked={formData.contentTypes.includes(option)}
                          onChange={() =>
                            updateFormData(
                              "contentTypes",
                              toggleArrayValue(formData.contentTypes, option),
                            )
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary mr-3"
                        checked={formData.contentTypes.includes("Other")}
                        onChange={() =>
                          updateFormData(
                            "contentTypes",
                            toggleArrayValue(formData.contentTypes, "Other"),
                          )
                        }
                      />
                      <span>Other</span>
                    </label>
                  </div>
                  
                  {formData.contentTypes.includes("Other") && (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newCustomContentType}
                          onChange={(e) => setNewCustomContentType(e.target.value)}
                          placeholder="Enter custom content type"
                          className="input input-bordered flex-1"
                        />
                        <button
                          onClick={() => addCustomOption('contentTypes', newCustomContentType)}
                          className="btn btn-primary"
                          disabled={!newCustomContentType.trim()}
                        >
                          Add
                        </button>
                      </div>
                      
                      {formData.customContentTypes.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Custom content types:</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.customContentTypes.map((item, index) => (
                              <div key={index} className="badge badge-primary badge-lg gap-1 p-3">
                                {item}
                                <button
                                  onClick={() => removeCustomOption('contentTypes', index)}
                                  className="ml-1"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {currentStep === "goals" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">
                    What are your writing goals?
                  </h1>
                  <p className="text-base-content/70">
                    Describe your writing goals in detail. Your protocol will be tailored to help you achieve these specific objectives.
                  </p>
                  <textarea
                    placeholder="For example: I want to create more engaging blog content, grow my email list through content marketing, establish myself as an authority in my niche, etc."
                    className="textarea textarea-bordered w-full h-48"
                    value={formData.goals}
                    onChange={(e) => updateFormData("goals", e.target.value)}
                    ref={(el) => {
                      activeInputRef.current = el;
                    }}
                  ></textarea>
                  
                  <div className="p-4 bg-base-200/40 rounded-lg">
                    <div className="flex items-start">
                      <span className="text-xl mr-2">💡</span>
                      <div>
                        <p className="font-semibold">Tip</p>
                        <p className="text-sm text-base-content/80">
                          Be specific about what you want to achieve with your writing. Include both short-term and long-term goals, as well as any metrics or outcomes that matter to you.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === "challenges" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">
                    What challenges do you face when writing?
                  </h1>
                  <p className="text-base-content/70">
                    Describe any struggles or obstacles you encounter in your writing process. Your protocol will include strategies to overcome these specific challenges.
                  </p>
                  <textarea
                    placeholder="For example: I struggle with writer's block, I find it difficult to maintain a consistent writing schedule, I have trouble organizing my thoughts, etc."
                    className="textarea textarea-bordered w-full h-48"
                    value={formData.challenges}
                    onChange={(e) => updateFormData("challenges", e.target.value)}
                    ref={(el) => {
                      activeInputRef.current = el;
                    }}
                  ></textarea>
                  
                  <div className="p-4 bg-base-200/40 rounded-lg">
                    <div className="flex items-start">
                      <span className="text-xl mr-2">💡</span>
                      <div>
                        <p className="font-semibold">Tip</p>
                        <p className="text-sm text-base-content/80">
                          Be honest about your challenges - identifying your specific pain points will help us create a protocol that addresses your actual needs and helps you overcome your unique obstacles.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === "leadMagnets" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">
                    Do you have any lead magnets?
                  </h1>
                  <p className="text-base-content/70">
                    Lead magnets help you build your audience and email list.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <label
                      className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                        formData.hasLeadMagnets ? "border-primary border-2" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        className="radio radio-primary mr-3"
                        checked={formData.hasLeadMagnets === true}
                        onChange={() => updateFormData("hasLeadMagnets", true)}
                      />
                      <span>Yes, I have lead magnets</span>
                    </label>
                    
                    <label
                      className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                        formData.hasLeadMagnets === false ? "border-primary border-2" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        className="radio radio-primary mr-3"
                        checked={formData.hasLeadMagnets === false}
                        onChange={() => {
                          setFormData(prev => ({
                            ...prev,
                            hasLeadMagnets: false,
                            leadMagnets: [],
                            leadMagnetDetails: ""
                          }));
                        }}
                      />
                      <span>No, not yet</span>
                    </label>
                  </div>
                  
                  {formData.hasLeadMagnets && (
                    <>
                      <h2 className="text-xl font-semibold mb-3">Select your existing lead magnets</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                        {leadMagnetOptions.map((option) => (
                          <label
                            key={option}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                              formData.leadMagnets.includes(option) ? "border-primary border-2" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="checkbox checkbox-primary mr-3"
                              checked={formData.leadMagnets.includes(option)}
                              onChange={() =>
                                updateFormData(
                                  "leadMagnets",
                                  toggleArrayValue(formData.leadMagnets, option)
                                )
                              }
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                      
                      <div>
                        <h2 className="text-xl font-semibold mb-2">Tell us more about your lead magnets</h2>
                        <textarea
                          placeholder="Describe your lead magnets in more detail (topics, conversion rates, how you promote them, etc.)"
                          className="textarea textarea-bordered w-full h-32"
                          value={formData.leadMagnetDetails}
                          onChange={(e) => updateFormData("leadMagnetDetails", e.target.value)}
                          ref={(el) => {
                            activeInputRef.current = el;
                          }}
                        ></textarea>
                      </div>
                    </>
                  )}
                  
                  {!formData.hasLeadMagnets && (
                    <div className="p-5 border rounded-lg bg-base-200/50 text-center">
                      <p className="text-base-content/80">
                        No problem! Your protocol will include suggestions for lead magnets you can create to grow your audience.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {currentStep === "offers" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">
                    Do you have products or services you offer?
                  </h1>
                  <p className="text-base-content/70">
                    This helps tailor your protocol to generate leads and sales for your business.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <label
                      className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                        formData.hasOffers ? "border-primary border-2" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        className="radio radio-primary mr-3"
                        checked={formData.hasOffers === true}
                        onChange={() => updateFormData("hasOffers", true)}
                      />
                      <span>Yes, I have offers</span>
                    </label>
                    
                    <label
                      className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                        !formData.hasOffers ? "border-primary border-2" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        className="radio radio-primary mr-3"
                        checked={formData.hasOffers === false}
                        onChange={() => {
                          setFormData(prev => ({
                            ...prev,
                            hasOffers: false,
                            offers: [],
                            offerDetails: ""
                          }));
                        }}
                      />
                      <span>No, not yet</span>
                    </label>
                  </div>
                  
                  {formData.hasOffers && (
                    <>
                      <h2 className="text-xl font-semibold mb-3">Select your current offerings</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                        {offerOptions.map((option) => (
                          <label
                            key={option}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                              formData.offers.includes(option) ? "border-primary border-2" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="checkbox checkbox-primary mr-3"
                              checked={formData.offers.includes(option)}
                              onChange={() =>
                                updateFormData(
                                  "offers",
                                  toggleArrayValue(formData.offers, option)
                                )
                              }
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                      
                      <div>
                        <h2 className="text-xl font-semibold mb-2">Tell us more about your offers</h2>
                        <textarea
                          placeholder="Describe your offers in more detail (price points, target audience, unique selling points, conversion rates, etc.)"
                          className="textarea textarea-bordered w-full h-32"
                          value={formData.offerDetails}
                          onChange={(e) => updateFormData("offerDetails", e.target.value)}
                          ref={(el) => {
                            activeInputRef.current = el;
                          }}
                        ></textarea>
                      </div>
                    </>
                  )}
                  
                  {!formData.hasOffers && (
                    <div className="p-5 border rounded-lg bg-base-200/50 text-center">
                      <p className="text-base-content/80">
                        No problem! Your protocol will focus on audience building and suggest possible offers you could create in the future.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {currentStep === "contentSample" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">
                    Upload a sample of your content
                  </h1>
                  <p className="text-base-content/70">
                    Sharing a sample of your existing content helps us better understand your style and create a more personalized protocol.
                  </p>
                  
                  <textarea
                    placeholder="Paste a sample of your content here (e.g., a blog post, article, or social media post that represents your writing style)"
                    className="textarea textarea-bordered w-full h-40"
                    value={formData.contentSample}
                    onChange={(e) => updateFormData("contentSample", e.target.value)}
                  ></textarea>
                  
                  <div className="p-4 bg-base-200/40 rounded-lg">
                    <div className="flex items-start">
                      <span className="text-xl mr-2">💡</span>
                      <div>
                        <p className="font-semibold">Tip</p>
                        <p className="text-sm text-base-content/80">
                          The more representative your sample is of your usual writing style, the better we can tailor your protocol. 
                          Aim for 200-500 words if possible.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === "contentBalance" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">Content Balance Preference</h1>
                  <p className="text-base-content/70">
                    Choose how you'd like to balance educational content with conversion-focused content.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    {/* Education First Option */}
                    <label className={`flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${formData.contentBalance === "education" ? "border-primary border-2" : ""}`}>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          className="radio radio-primary mr-3"
                          checked={formData.contentBalance === "education"}
                          onChange={() => updateFormData("contentBalance", "education")}
                        />
                        <span className="font-bold">Education First 📚</span>
                      </div>
                      <div className="ml-8 mt-2">
                        <p className="text-base-content/70 mb-2">
                          Focus more on providing value and educating your audience (80% educational, 20% promotional content)
                        </p>
                        <div className="w-full bg-base-200 h-3 rounded-full overflow-hidden flex">
                          <div className="bg-blue-400 h-full" style={{ width: "80%" }}></div>
                          <div className="bg-amber-400 h-full" style={{ width: "20%" }}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>Educational</span>
                          <span>Promotional</span>
                        </div>
                      </div>
                    </label>
                
                    {/* Balanced Approach Option */}
                    <label className={`flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${formData.contentBalance === "balanced" ? "border-primary border-2" : ""}`}>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          className="radio radio-primary mr-3"
                          checked={formData.contentBalance === "balanced"}
                          onChange={() => updateFormData("contentBalance", "balanced")}
                        />
                        <span className="font-bold">Balanced Approach ⚖️</span>
                      </div>
                      <div className="ml-8 mt-2">
                        <p className="text-base-content/70 mb-2">
                          Equal focus on educational content and promotional material (50% educational, 50% promotional)
                        </p>
                        <div className="w-full bg-base-200 h-3 rounded-full overflow-hidden flex">
                          <div className="bg-blue-400 h-full" style={{ width: "50%" }}></div>
                          <div className="bg-amber-400 h-full" style={{ width: "50%" }}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>Educational</span>
                          <span>Promotional</span>
                        </div>
                      </div>
                    </label>
                
                    {/* Conversion Focused Option */}
                    <label className={`flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${formData.contentBalance === "conversion" ? "border-primary border-2" : ""}`}>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          className="radio radio-primary mr-3"
                          checked={formData.contentBalance === "conversion"}
                          onChange={() => updateFormData("contentBalance", "conversion")}
                        />
                        <span className="font-bold">Conversion Focused 🎯</span>
                      </div>
                      <div className="ml-8 mt-2">
                        <p className="text-base-content/70 mb-2">
                          More emphasis on promoting your offers and driving conversions (40% educational, 60% promotional)
                        </p>
                        <div className="w-full bg-base-200 h-3 rounded-full overflow-hidden flex">
                          <div className="bg-blue-400 h-full" style={{ width: "40%" }}></div>
                          <div className="bg-amber-400 h-full" style={{ width: "60%" }}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>Educational</span>
                          <span>Promotional</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

              )}

              {currentStep === "processing" && (
                <div className="space-y-6 text-center">
                  <h1 className="text-3xl font-bold">
                    Creating your writing protocol...
                  </h1>
                  <p className="text-base-content/70">
                    Our AI is analyzing your responses and crafting a
                    personalized writing system for you.
                  </p>
                  <div className="flex flex-col items-center my-8">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <div className="w-full max-w-xs bg-base-200 rounded-full h-2.5 mb-2">
                      <div className="bg-primary h-2.5 rounded-full" style={{ 
                        width: `${Math.min(processingTimePassed / 120 * 100, 98)}%` 
                      }}></div>
                    </div>
                    <p className="text-sm text-base-content/50">
                      This may take up to 3 minutes ({Math.floor(processingTimePassed)} seconds elapsed)
                    </p>
                  </div>
                  <div className="text-sm text-base-content/70 p-4 bg-base-200 rounded-lg">
                    <p className="font-medium mb-2">What's happening now:</p>
                    <ul className="list-disc pl-5 space-y-1 text-left">
                      <li>The AI is analyzing your role, industry, and content types</li>
                      <li>It's developing a comprehensive niche authority positioning</li>
                      <li>Creating tailored content pillars for your specific audience</li>
                      <li>Designing an efficient content repurposing system</li>
                      <li>Crafting a strategic conversion funnel for your business</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep !== "processing" && (
                <div className="mt-10 flex justify-between items-center">
                  {currentStep !== "title" ? (
                    <button
                      onClick={goToPreviousStep}
                      className="btn btn-ghost gap-2"
                    >
                      <FaArrowLeft size={12} /> Back
                    </button>
                  ) : (
                    <div></div>
                  )}

                  <button
                    onClick={goToNextStep}
                    disabled={!canProceed()}
                    className="btn btn-primary"
                  >
                    {currentStep === "contentBalance"
                      ? "Create Protocol"
                      : "Continue"}
                    <FaArrowRight size={12} className="ml-2" />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const STEPS: Step[] = [
  "title",
  "role",
  "industry",
  "experience",
  "audience",
  "timeAvailability",
  "onlinePresence",
  "platformSelection",
  "platformDetails",
  "contentTypes",
  "goals",
  "challenges",
  "leadMagnets",
  "offers",
  "contentSample",
  "contentBalance",
  "processing",
];
