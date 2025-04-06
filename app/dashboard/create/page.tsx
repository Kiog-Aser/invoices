"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";

// Define step types for our typeform-style form
type Step =
  | "title"
  | "modelSelect"
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
  | "processing";

interface FormData {
  title: string;
  userRole: string;
  industry: string;
  contentTypes: string[];
  goals: string[];
  challenges: string[];
  customContentTypes: string[];
  customGoals: string[];
  customChallenges: string[];
  modelType: 'fast' | 'quality';
  
  // New fields for additional user context
  experience: string;
  audience: string[];
  audienceDetails: string; // New field for detailed audience description
  timeAvailability: string;
  onlinePresence: {
    platforms: string[];
    platformDetails: Record<string, {
      followersCount: string;
      postFrequency: string;
    }>;
  };
  hasLeadMagnets: boolean; // New field to track if they have lead magnets
  leadMagnets: string[];
  leadMagnetDetails: string; // New field for detailed lead magnet description
  hasOffers: boolean; // New field to track if they have offers
  offers: string[];
  offerDetails: string; // New field for detailed offer description
}

// Define the type for platform details
type PlatformDetail = {
  metricName: string;
  ranges: string[];
};

// Type-safe platform details
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
  const [currentStep, setCurrentStep] = useState<Step>("title");
  const [formData, setFormData] = useState<FormData>({
    title: "",
    userRole: "",
    industry: "",
    contentTypes: [],
    goals: [],
    challenges: [],
    customContentTypes: [],
    customGoals: [],
    customChallenges: [],
    modelType: 'fast',
    experience: "",
    audience: [],
    audienceDetails: "",
    timeAvailability: "",
    onlinePresence: {
      platforms: [],
      platformDetails: {},
    },
    hasLeadMagnets: false,
    leadMagnets: [],
    leadMagnetDetails: "",
    hasOffers: false,
    offers: [],
    offerDetails: "",
  });

  // Add protocol access state
  const [hasProtocolAccess, setHasProtocolAccess] = useState(true);
  const [accessDetails, setAccessDetails] = useState<{
    isUnlimited: boolean;
    tokens: number;
  }>({ isUnlimited: false, tokens: 0 });

  // Custom inputs temporary states
  const [newCustomContentType, setNewCustomContentType] = useState("");
  const [newCustomGoal, setNewCustomGoal] = useState("");
  const [newCustomChallenge, setNewCustomChallenge] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(
    null,
  );

  // For polling protocol status
  const [protocolId, setProtocolId] = useState<string | null>(null);
  const [processingTimePassed, setProcessingTimePassed] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Content type options
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

  // Goal options
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

  // Challenges options
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

  // Add options for additional fields
  const experienceLevelOptions = [
    "Beginner (0-1 years)",
    "Intermediate (1-3 years)",
    "Advanced (3-5 years)",
    "Expert (5+ years)"
  ];

  // Updated audience selection approach
  const audienceOptions = [
    {
      category: "Professionals",
      examples: "Corporate employees, Knowledge workers, Industry specialists"
    },
    {
      category: "Business Owners",
      examples: "Entrepreneurs, Small business owners, Startups, Executives"
    },
    {
      category: "Creative Professionals",
      examples: "Designers, Writers, Artists, Photographers"
    },
    {
      category: "Technical Audience",
      examples: "Developers, Engineers, IT professionals, Data scientists"
    },
    {
      category: "Academia",
      examples: "Students, Researchers, Educators, Academic institutions"
    },
    {
      category: "Consumer Groups",
      examples: "Parents, Health enthusiasts, Hobbyists, Lifestyle focus"
    },
    {
      category: "Industry Specific",
      examples: "Healthcare, Finance, Legal, Real estate, Construction"
    }
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

  // Add lead magnet and offer options
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

  // Add state for platform details questions
  const [currentPlatformIndex, setCurrentPlatformIndex] = useState<number>(0);

  // Focus the active input when step changes
  useEffect(() => {
    if (activeInputRef.current) {
      activeInputRef.current.focus();
    }
  }, [currentStep]);

  // Handle checking if authenticated and has protocol access
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      checkProtocolAccess();
    }
  }, [status, router]);

  // Check if user has access to create protocols
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
      
      // If user doesn't have access, show a message and redirect to pricing
      if (!data.hasAccess) {
        toast.error('You need to purchase access to create protocols');
        setTimeout(() => router.push('/#pricing'), 1500);
      }
    } catch (error) {
      console.error('Error checking protocol access:', error);
      toast.error('Failed to verify protocol access');
    }
  };

  // Update form data
  const updateFormData = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Check if the current step is valid
  const canProceed = (): boolean => {
    switch (currentStep) {
      case "title":
        return !!formData.title;
      case "modelSelect":
        return !!formData.modelType; // Always valid since we have a default value
      case "role":
        return !!formData.userRole;
      case "industry":
        return !!formData.industry;
      case "contentTypes":
        return formData.contentTypes.length > 0;
      case "goals":
        return formData.goals.length > 0;
      case "challenges":
        return formData.challenges.length > 0;
      case "experience":
        return !!formData.experience;
      case "audience":
        return formData.audience.length > 0;
      case "timeAvailability":
        return !!formData.timeAvailability;
      case "onlinePresence":
        return true; // Always valid since we allow proceeding without platforms
      case "platformSelection":
        return formData.onlinePresence.platforms.length > 0;
      case "platformDetails":
        return true; // Always valid since we allow proceeding without platforms
      case "leadMagnets":
        return formData.hasLeadMagnets ? formData.leadMagnets.length > 0 : true;
      case "offers":
        return formData.hasOffers ? formData.offers.length > 0 : true;
      default:
        return false;
    }
  };

  // Go to next step
  const goToNextStep = () => {
    if (!canProceed()) return;

    switch (currentStep) {
      case "title":
        setCurrentStep("modelSelect");
        break;
      case "modelSelect":
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
        // If they have no online presence, skip platform questions
        if (formData.onlinePresence.platforms.length === 0) {
          setCurrentStep("contentTypes");
        } else {
          setCurrentStep("platformSelection");
        }
        break;
      case "platformSelection":
        // Reset platform index before showing platform details
        setCurrentPlatformIndex(0);
        setCurrentStep("platformDetails");
        break;
      case "platformDetails":
        // If we have more platforms to collect details for, increment the index
        if (currentPlatformIndex < formData.onlinePresence.platforms.length - 1) {
          setCurrentPlatformIndex(currentPlatformIndex + 1);
        } else {
          // We've collected details for all platforms, move to content types
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
        setCurrentStep("processing");
        handleSubmit();
        break;
      default:
        break;
    }
  };

  // Go to previous step
  const goToPreviousStep = () => {
    switch (currentStep) {
      case "modelSelect":
        setCurrentStep("title");
        break;
      case "role":
        setCurrentStep("modelSelect");
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
          // Go to previous platform's details
          setCurrentPlatformIndex(currentPlatformIndex - 1);
        } else {
          // Go back to platform selection
          setCurrentStep("platformSelection");
        }
        break;
      case "contentTypes":
        if (formData.onlinePresence.platforms.length > 0) {
          // If they had platforms, go back to the last platform's details
          setCurrentPlatformIndex(formData.onlinePresence.platforms.length - 1);
          setCurrentStep("platformDetails");
        } else {
          // Otherwise go back to online presence question
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
      case "processing":
        setCurrentStep("offers");
        break;
      default:
        break;
    }
  };

  // Toggle a value in a string array
  const toggleArrayValue = (array: string[], value: string): string[] => {
    if (array.includes(value)) {
      return array.filter((item) => item !== value);
    } else {
      return [...array, value];
    }
  };

  // Add a custom option to the form data
  const addCustomOption = (
    category: 'contentTypes' | 'goals' | 'challenges',
    value: string
  ) => {
    if (!value.trim()) return;
    
    const customFieldName = `custom${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof FormData;
    const newCustomValues = [...(formData[customFieldName] as string[]), value.trim()];
    updateFormData(customFieldName, newCustomValues);
    
    // Reset the input field
    switch(category) {
      case 'contentTypes':
        setNewCustomContentType('');
        break;
      case 'goals':
        setNewCustomGoal('');
        break;
      case 'challenges':
        setNewCustomChallenge('');
        break;
    }
  };

  // Remove a custom option from the form data
  const removeCustomOption = (
    category: 'contentTypes' | 'goals' | 'challenges',
    index: number
  ) => {
    const customFieldName = `custom${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof FormData;
    const newCustomValues = [...(formData[customFieldName] as string[])];
    newCustomValues.splice(index, 1);
    updateFormData(customFieldName, newCustomValues);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Check access again right before submission
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
      toast.loading("Creating your writing protocol...");

      // Simple validation to ensure we have at least a title
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }

      // Prepare data for submission by combining regular options with custom options
      const submissionData = {
        ...formData,
        // Merge custom content types with regular content types (excluding "Other")
        contentTypes: formData.contentTypes.includes("Other") 
          ? [...formData.contentTypes.filter(type => type !== "Other"), ...formData.customContentTypes]
          : formData.contentTypes,
        // Merge custom goals with regular goals (excluding "Other")
        goals: formData.goals.includes("Other")
          ? [...formData.goals.filter(goal => goal !== "Other"), ...formData.customGoals]
          : formData.goals,
        // Merge custom challenges with regular challenges (excluding "Other")
        challenges: formData.challenges.includes("Other")
          ? [...formData.challenges.filter(challenge => challenge !== "Other"), ...formData.customChallenges]
          : formData.challenges,
      };

      // Submit the form data to the API
      const response = await fetch("/api/writing-protocol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      // Handle error responses
      if (!response.ok) {
        let errorMessage = "Failed to create writing protocol";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse JSON, use default error message
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      const result = await response.json();

      // Consume a token if needed (if not unlimited)
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

      // Update loading toast with more specific message
      toast.dismiss();
      toast.loading(
        `Your protocol is being generated ${formData.modelType === 'quality' ? '(this may take 2-3 minutes)' : ''}...`, 
        { duration: 60000 }
      );

      // Store the protocol ID for polling
      if (result && result._id) {
        setProtocolId(result._id);
        startPolling(result._id);
      } else {
        // If no ID was returned, something went wrong
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
      setCurrentStep("offers"); // Go back to the last step
      setIsProcessing(false);
    }
  };

  // Start polling for protocol status
  const startPolling = (id: string) => {
    // Set up polling timer to check protocol status
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Poll every 3 seconds
    pollIntervalRef.current = setInterval(async () => {
      try {
        // Increment the time counter (for UI)
        setProcessingTimePassed(prev => prev + 3);
        
        // Check protocol status
        const response = await fetch(`/api/writing-protocol?id=${id}`, {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch protocol status');
        }

        const protocol = await response.json();
        
        // If the protocol generation is complete or failed
        if (protocol.status === 'completed' || protocol.status === 'failed') {
          // Clear the polling interval
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }

          // If completed, redirect to the protocol page
          if (protocol.status === 'completed') {
            toast.dismiss();
            toast.success('Your writing protocol is ready!');
            router.push(`/dashboard/${id}`);
          } 
          // If failed, show error and allow retrying
          else if (protocol.status === 'failed') {
            toast.dismiss();
            toast.error(protocol.statusMessage || 'Failed to generate protocol. Please try again.');
            setCurrentStep('offers');
            setIsProcessing(false);
          }
        }
      } catch (error) {
        console.error("Error polling protocol status:", error);
      }
    }, 3000);
  };

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Handle keyboard navigation
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

  // Show loading state if checking auth
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-base-200 z-10">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{
            width: `${(STEPS.indexOf(currentStep) + 1) * (100 / STEPS.length)}%`,
          }}
        ></div>
      </div>

      {/* Main content */}
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

              {currentStep === "modelSelect" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">
                    Choose AI Quality Level
                  </h1>
                  <p className="text-base-content/70">
                    Select the AI quality level that best fits your needs.
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <label className={`flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${formData.modelType === "fast" ? "border-primary border-2" : ""}`}>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          className="radio radio-primary mr-3"
                          checked={formData.modelType === "fast"}
                          onChange={() => updateFormData("modelType", "fast")}
                        />
                        <span className="font-bold text-lg">Fast Generation (⚡️ ~1 minute)</span>
                      </div>
                      <p className="text-base-content/70 mt-2 ml-8">
                        Quick generation of writing protocols for standard use cases. Good for most situations.
                      </p>
                    </label>
                    
                    <label className={`flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${formData.modelType === "quality" ? "border-primary border-2" : ""}`}>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          className="radio radio-primary mr-3"
                          checked={formData.modelType === "quality"}
                          onChange={() => updateFormData("modelType", "quality")}
                        />
                        <span className="font-bold text-lg">High Quality Generation (⏱️ ~2-3 minutes)</span>
                      </div>
                      <p className="text-base-content/70 mt-2 ml-8">
                        Takes more time but produces more detailed and thoughtful writing protocols with deeper insights. Recommended for professional use cases.
                      </p>
                    </label>
                  </div>
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
                    Select all audience types that apply to your content.
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {audienceOptions.map((option) => (
                      <label
                        key={option.category}
                        className={`flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                          formData.audience.includes(option.category) ? "border-primary border-2" : ""
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary mr-3"
                            checked={formData.audience.includes(option.category)}
                            onChange={() =>
                              updateFormData(
                                "audience",
                                toggleArrayValue(formData.audience, option.category)
                              )
                            }
                          />
                          <span className="font-medium">{option.category}</span>
                        </div>
                        <p className="text-sm text-base-content/70 mt-1 ml-8">
                          Examples: {option.examples}
                        </p>
                      </label>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Tell us more about your audience</h2>
                    <textarea
                      placeholder="Describe your specific audience in more detail (demographics, psychographics, pain points, desires, etc.)"
                      className="textarea textarea-bordered w-full h-32"
                      value={formData.audienceDetails}
                      onChange={(e) => updateFormData("audienceDetails", e.target.value)}
                      ref={(el) => {
                        activeInputRef.current = el;
                      }}
                    ></textarea>
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
                          // Just set an empty array - we'll select platforms in the next step
                          updateFormData("onlinePresence", {
                            platforms: ["Website/Blog"],
                            platformDetails: {}
                          });
                          // Go to platform selection on "Yes"
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
                          // Skip ahead to contentTypes on "No"
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
                            // If "Website/Blog" was the placeholder, remove it when selecting actual platforms
                            let currentPlatforms = formData.onlinePresence.platforms;
                            if (currentPlatforms.length === 1 && currentPlatforms[0] === "Website/Blog" && platform !== "Website/Blog") {
                              currentPlatforms = [];
                            }
                            
                            const updatedPlatforms = toggleArrayValue(
                              currentPlatforms,
                              platform
                            );
                            
                            // Initialize platform details when checked
                            const updatedPlatformDetails = { ...formData.onlinePresence.platformDetails };
                            
                            if (!currentPlatforms.includes(platform) && updatedPlatforms.includes(platform)) {
                              updatedPlatformDetails[platform] = {
                                followersCount: platformDetails[platform]?.ranges[0] || "",
                                postFrequency: frequencyOptions[0]
                              };
                            }
                            
                            // Remove platform details when unchecked
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
                        {/* Audience size slider */}
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
                        
                        {/* Posting frequency slider */}
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
                  
                  {/* Custom content types input */}
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
                      
                      {/* Display custom content types */}
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
                    Select all that apply. Your protocol will focus on these
                    goals.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {goalOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary mr-3"
                          checked={formData.goals.includes(option)}
                          onChange={() =>
                            updateFormData(
                              "goals",
                              toggleArrayValue(formData.goals, option),
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
                        checked={formData.goals.includes("Other")}
                        onChange={() =>
                          updateFormData(
                            "goals",
                            toggleArrayValue(formData.goals, "Other"),
                          )
                        }
                      />
                      <span>Other</span>
                    </label>
                  </div>
                  
                  {/* Custom goals input */}
                  {formData.goals.includes("Other") && (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newCustomGoal}
                          onChange={(e) => setNewCustomGoal(e.target.value)}
                          placeholder="Enter custom goal"
                          className="input input-bordered flex-1"
                        />
                        <button
                          onClick={() => addCustomOption('goals', newCustomGoal)}
                          className="btn btn-primary"
                          disabled={!newCustomGoal.trim()}
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Display custom goals */}
                      {formData.customGoals.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Custom goals:</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.customGoals.map((item, index) => (
                              <div key={index} className="badge badge-primary badge-lg gap-1 p-3">
                                {item}
                                <button
                                  onClick={() => removeCustomOption('goals', index)}
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

              {currentStep === "challenges" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">
                    What challenges do you face when writing?
                  </h1>
                  <p className="text-base-content/70">
                    Select all that apply. Your protocol will include strategies
                    to overcome these challenges.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {challengeOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary mr-3"
                          checked={formData.challenges.includes(option)}
                          onChange={() =>
                            updateFormData(
                              "challenges",
                              toggleArrayValue(formData.challenges, option),
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
                        checked={formData.challenges.includes("Other")}
                        onChange={() =>
                          updateFormData(
                            "challenges",
                            toggleArrayValue(formData.challenges, "Other"),
                          )
                        }
                      />
                      <span>Other</span>
                    </label>
                  </div>
                  
                  {/* Custom challenges input */}
                  {formData.challenges.includes("Other") && (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newCustomChallenge}
                          onChange={(e) => setNewCustomChallenge(e.target.value)}
                          placeholder="Enter custom challenge"
                          className="input input-bordered flex-1"
                        />
                        <button
                          onClick={() => addCustomOption('challenges', newCustomChallenge)}
                          className="btn btn-primary"
                          disabled={!newCustomChallenge.trim()}
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Display custom challenges */}
                      {formData.customChallenges.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Custom challenges:</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.customChallenges.map((item, index) => (
                              <div key={index} className="badge badge-primary badge-lg gap-1 p-3">
                                {item}
                                <button
                                  onClick={() => removeCustomOption('challenges', index)}
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
                        checked={formData.hasLeadMagnets}
                        onChange={() => updateFormData("hasLeadMagnets", true)}
                      />
                      <span>Yes, I have lead magnets</span>
                    </label>
                    
                    <label
                      className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                        !formData.hasLeadMagnets ? "border-primary border-2" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        className="radio radio-primary mr-3"
                        checked={!formData.hasLeadMagnets}
                        onChange={() => {
                          updateFormData("hasLeadMagnets", false);
                          updateFormData("leadMagnets", []);
                          updateFormData("leadMagnetDetails", "");
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
                        checked={formData.hasOffers}
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
                        checked={!formData.hasOffers}
                        onChange={() => {
                          updateFormData("hasOffers", false);
                          updateFormData("offers", []);
                          updateFormData("offerDetails", "");
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
                        width: `${Math.min(processingTimePassed / (formData.modelType === 'quality' ? 120 : 60) * 100, 98)}%` 
                      }}></div>
                    </div>
                    <p className="text-sm text-base-content/50">
                      {formData.modelType === 'quality' 
                        ? `This may take up to 3 minutes (${Math.floor(processingTimePassed)} seconds elapsed)`
                        : `This may take up to 1 minute (${Math.floor(processingTimePassed)} seconds elapsed)`}
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

              {/* Navigation buttons */}
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
                    {currentStep === "offers"
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

// Steps array for progress tracking
const STEPS: Step[] = [
  "title",
  "modelSelect",
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
  "processing",
];
