"use client";

import { useState } from "react";
import FeedbackModal from "./FeedbackModal";

interface FeedbackButtonProps {
  pageContext?: string; // Optional context about which page the feedback is coming from
}

export default function FeedbackButton({ pageContext }: FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating vertical button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed right-5 bottom-1/2 -translate-y-1/2 bg-primary hover:bg-primary-focus text-primary-content font-mono font-bold py-3 px-2 -rotate-90 origin-right transform shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-x-[2px] transition-all duration-200 z-30 rounded-t-lg"
        aria-label="Open feedback form"
      >
        Feedback?
      </button>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pageContext={pageContext}
      />
    </>
  );
}
