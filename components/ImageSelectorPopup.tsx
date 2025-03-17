"use client";

import React, { useState, useRef, Fragment } from "react";
import { FaUpload } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";

// Popular brand logos with their names and URLs - including Stripe and PayPal
const POPULAR_LOGOS = [
  { name: "Stripe", url: "https://cdn.iconscout.com/icon/free/png-256/free-stripe-2-498440.png" },
  { name: "PayPal", url: "https://cdn.iconscout.com/icon/free/png-256/free-paypal-54-675727.png" },
  { name: "Gmail", url: "https://cdn.iconscout.com/icon/free/png-256/free-gmail-2981844-2476484.png" },
  { name: "Facebook", url: "https://cdn.iconscout.com/icon/free/png-256/free-facebook-263-721950.png" },
  { name: "X", url: "https://www.google.com/s2/favicons?domain=x.com&sz=256" },
  { name: "Instagram", url: "https://cdn.iconscout.com/icon/free/png-256/free-instagram-1868978-1583142.png" },
  { name: "LinkedIn", url: "https://cdn.iconscout.com/icon/free/png-256/free-linkedin-162-498418.png" },
  { name: "YouTube", url: "https://cdn.iconscout.com/icon/free/png-256/free-youtube-85-226402.png" },
  { name: "TikTok", url: "https://www.google.com/s2/favicons?domain=tiktok.com&sz=256" },
  { name: "Pinterest", url: "https://www.google.com/s2/favicons?domain=pinterest.com&sz=256" },
  { name: "Discord", url: "https://www.google.com/s2/favicons?domain=discord.com&sz=256" },
  { name: "WhatsApp", url: "https://www.google.com/s2/favicons?domain=whatsapp.com&sz=256" }
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
                          <Image 
                            src={imageUrl} 
                            alt="Preview" 
                            width={160}
                            height={160}
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
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {POPULAR_LOGOS.map(logo => (
                        <div key={logo.name} className="text-center">
                          <Image
                            src={logo.url}
                            alt={logo.name}
                            width={64}
                            height={64}
                            className="mx-auto mb-2"
                          />
                          <span className="text-sm">{logo.name}</span>
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