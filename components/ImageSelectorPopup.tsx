"use client";

import React, { useState, useRef, Fragment } from "react";
import { FaUpload, FaTimes } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";

// Popular brand logos with their names and URLs - including Stripe and PayPal
const POPULAR_LOGOS = [
  { name: "Stripe", url: "https://www.google.com/s2/favicons?domain=stripe.com&sz=64" },
  { name: "PayPal", url: "https://www.google.com/s2/favicons?domain=paypal.com&sz=64" },
  { name: "Facebook", url: "https://www.google.com/s2/favicons?domain=facebook.com&sz=64" },
  { name: "Twitter", url: "https://www.google.com/s2/favicons?domain=twitter.com&sz=64" },
  { name: "Instagram", url: "https://www.google.com/s2/favicons?domain=instagram.com&sz=64" },
  { name: "LinkedIn", url: "https://www.google.com/s2/favicons?domain=linkedin.com&sz=64" },
  { name: "YouTube", url: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64" },
  { name: "TikTok", url: "https://www.google.com/s2/favicons?domain=tiktok.com&sz=64" },
  { name: "Slack", url: "https://www.google.com/s2/favicons?domain=slack.com&sz=64" }
];

interface ImageSelectorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function ImageSelectorPopup({ isOpen, onClose, onSelect }: ImageSelectorPopupProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "popular">("upload");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        initialFocus={imageInputRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-base-300/50" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-box bg-base-100 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 mb-4"
                >
                  Select Image
                </Dialog.Title>

                <div className="tabs tabs-boxed mb-4">
                  <button
                    className={`tab flex-1 ${activeTab === "upload" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("upload")}
                  >
                    Upload Image
                  </button>
                  <button
                    className={`tab flex-1 ${activeTab === "popular" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("popular")}
                  >
                    Popular Logos
                  </button>
                </div>

                <div className="mt-2 space-y-4">
                  {activeTab === "upload" ? (
                    <div className="space-y-4">
                      <div 
                        className={`border-2 border-dashed rounded-box p-8 text-center cursor-pointer ${
                          isDragging ? "border-primary bg-primary/10" : "border-base-content/20 hover:border-primary/50"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <FaUpload className="mx-auto h-10 w-10 text-base-content/60" />
                        <p className="mt-2 text-sm font-medium">
                          Drop image here or click to upload
                        </p>
                        <p className="mt-1 text-xs text-base-content/60">
                          PNG, JPG, GIF up to 5MB
                        </p>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                          ref={imageInputRef}
                        />
                      </div>
                      
                      {imageUrl && (
                        <div className="flex flex-col items-center space-y-3">
                          <img 
                            src={imageUrl} 
                            alt="Preview" 
                            className="h-40 object-contain rounded-box"
                          />
                          <button
                            onClick={() => onSelect(imageUrl)}
                            className="btn btn-primary"
                          >
                            Use This Image
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {POPULAR_LOGOS.map((logo) => (
                        <div 
                          key={logo.name}
                          className="card bg-base-100 hover:bg-base-200 cursor-pointer p-3 transition-all"
                          onClick={() => onSelect(logo.url)}
                        >
                          <img 
                            src={logo.url} 
                            alt={logo.name}
                            className="w-12 h-12 object-contain mx-auto"
                          />
                          <span className="mt-2 text-sm text-center font-medium">{logo.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2 justify-end">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onClose}
                  >
                    Done
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}