"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaTwitter } from "react-icons/fa";
import confetti from "canvas-confetti";

export default function ThankYouPage() {
  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 max-w-2xl mx-auto"
      >
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-success">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold">Thank You!</h1>
          <p className="text-xl text-base-content/70">
            We really appreciate you taking the time to share your experience with NotiFast.
            Your story will help others discover how they can improve their website engagement!
          </p>
        </div>

        <div className="card bg-base-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Share NotiFast with others</h2>
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(
              "Just shared my experience with @NotiFast! They're revolutionizing website engagement with real-time social proof notifications 🚀\n\nCheck them out:"
            )}&url=https://notifast.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary gap-2"
          >
            <FaTwitter /> Share on X
          </a>
        </div>

        <div className="space-y-4">
          <Link href="/dashboard" className="btn btn-ghost w-full">
            Return to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}