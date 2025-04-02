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
  | "role"
  | "industry"
  | "contentTypes"
  | "goals"
  | "challenges"
  | "processing";

interface FormData {
  title: string;
  userRole: string;
  industry: string;
  contentTypes: string[];
  goals: string[];
  challenges: string[];
  customContentTypes: string[]; // Add custom types
  customGoals: string[]; // Add custom goals
  customChallenges: string[]; // Add custom challenges
}

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
  });

  // Custom inputs temporary states
  const [newCustomContentType, setNewCustomContentType] = useState("");
  const [newCustomGoal, setNewCustomGoal] = useState("");
  const [newCustomChallenge, setNewCustomChallenge] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(
    null,
  );

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

  // Focus the active input when step changes
  useEffect(() => {
    if (activeInputRef.current) {
      activeInputRef.current.focus();
    }
  }, [currentStep]);

  // Handle checking if authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

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
      default:
        return false;
    }
  };

  // Go to next step
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
        setCurrentStep("contentTypes");
        break;
      case "contentTypes":
        setCurrentStep("goals");
        break;
      case "goals":
        setCurrentStep("challenges");
        break;
      case "challenges":
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
      case "role":
        setCurrentStep("title");
        break;
      case "industry":
        setCurrentStep("role");
        break;
      case "contentTypes":
        setCurrentStep("industry");
        break;
      case "goals":
        setCurrentStep("contentTypes");
        break;
      case "challenges":
        setCurrentStep("goals");
        break;
      case "processing":
        setCurrentStep("challenges");
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
      const protocol = await response.json();

      // Dismiss loading toast
      toast.dismiss();
      toast.success("Writing protocol created successfully!");

      // Redirect to the results page
      if (protocol && protocol._id) {
        router.push(`/dashboard/writing-protocol/${protocol._id}`);
      } else {
        router.push("/dashboard/writing-protocol");
      }
    } catch (error) {
      console.error("Error creating writing protocol:", error);
      toast.dismiss();
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create writing protocol",
      );
      setCurrentStep("challenges"); // Go back to the last step
      setIsProcessing(false);
    }
  };

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

              {currentStep === "processing" && (
                <div className="space-y-6 text-center">
                  <h1 className="text-3xl font-bold">
                    Creating your writing protocol...
                  </h1>
                  <p className="text-base-content/70">
                    Our AI is analyzing your responses and crafting a
                    personalized writing system for you.
                  </p>
                  <div className="flex justify-center my-8">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                  </div>
                  <p className="text-sm text-base-content/50">
                    This typically takes 15-30 seconds.
                  </p>
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
                    {currentStep === "challenges"
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
  "role",
  "industry",
  "contentTypes",
  "goals",
  "challenges",
  "processing",
];
