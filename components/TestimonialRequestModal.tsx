"use client";

import { useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface TestimonialRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TestimonialRequestModal({ isOpen, onClose }: TestimonialRequestModalProps) {
  const router = useRouter();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-base-100 text-left align-middle shadow-xl transition-all">
                <div className="relative grid md:grid-cols-2">
                  {/* Close button */}
                  <button 
                    onClick={onClose}
                    className="btn btn-circle btn-ghost absolute right-2 top-2 z-10"
                  >
                    ✕
                  </button>

                  {/* Left side - Image */}
                  <div className="relative h-48 md:h-full bg-gradient-to-br from-primary to-primary-focus">
                    <div className="absolute inset-0 opacity-10 pattern-bg" />
                    <div className="p-6 relative z-10 h-full flex flex-col justify-center text-primary-content">
                      <h3 className="font-bold text-2xl mb-2">Share Your Story</h3>
                      <p>Help others discover how NotiFast can transform their website engagement.</p>
                    </div>
                  </div>
                  
                  {/* Right side - Content */}
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg">Why Share?</h4>
                        <ul className="space-y-2 text-sm text-base-content/70">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            Help others discover NotiFast
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            Get featured on our website
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            Inspire our product roadmap
                          </li>
                        </ul>
                      </div>
                      
                      <button
                        onClick={() => {
                          onClose();
                          router.push('/testimonial/new');
                        }}
                        className="btn btn-primary w-full"
                      >
                        Share My Story
                      </button>
                      
                      <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm w-full"
                      >
                        Maybe Later
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}