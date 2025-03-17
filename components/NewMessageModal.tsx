"use client";
import { useState, useEffect } from "react";
import { FaTimes, FaImage, FaPlay, FaClock } from "react-icons/fa";

// Define popular icons
const POPULAR_ICONS = [
  { name: "Stripe", url: "https://cdn.iconscout.com/icon/free/png-256/free-stripe-2-498440.png" },
  { name: "PayPal", url: "https://cdn.iconscout.com/icon/free/png-256/free-paypal-54-675727.png" },
  { name: "Gmail", url: "https://cdn.iconscout.com/icon/free/png-256/free-gmail-2981844-2476484.png" },
  { name: "Facebook", url: "https://cdn.iconscout.com/icon/free/png-256/free-facebook-263-721950.png" },
  { name: "X", url: "https://www.google.com/s2/favicons?domain=x.com&sz=64" },
  { name: "Instagram", url: "https://cdn.iconscout.com/icon/free/png-256/free-instagram-1868978-1583142.png" },
  { name: "LinkedIn", url: "https://cdn.iconscout.com/icon/free/png-256/free-linkedin-162-498418.png" },
  { name: "YouTube", url: "https://cdn.iconscout.com/icon/free/png-256/free-youtube-85-226402.png" },
  { name: "TikTok", url: "https://www.google.com/s2/favicons?domain=tiktok.com&sz=64" },
  { name: "Pinterest", url: "https://www.google.com/s2/favicons?domain=pinterest.com&sz=64" },
  { name: "Discord", url: "https://www.google.com/s2/favicons?domain=discord.com&sz=64" },
  { name: "WhatsApp", url: "https://www.google.com/s2/favicons?domain=whatsapp.com&sz=64" }
];

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (message: { 
    title: string; 
    content: string; 
    icon: string;
    duration: number;
  }) => void;
  initialData?: {
    title: string;
    content: string;
    icon: string;
    duration: number;
  };
  isEditing?: boolean;
}

export default function NewMessageModal({ 
  isOpen, 
  onClose, 
  onSave,
  initialData,
  isEditing = false
}: NewMessageModalProps) {
  // Add missing state variables
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [icon, setIcon] = useState(initialData?.icon || "");
  const [duration, setDuration] = useState(initialData?.duration || 5000);
  const [activeTab, setActiveTab] = useState<"url" | "popular">("url");
  const [showPreview, setShowPreview] = useState(false);

  // Update state when initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setIcon(initialData.icon);
      setDuration(initialData.duration);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !content) return;
    
    onSave({
      title,
      content,
      icon: icon || `https://www.google.com/s2/favicons?domain=example.com&sz=64`,
      duration,
    });
    onClose();
  };

  const handleFetchFavicon = () => {
    if (!icon) return;
    try {
      let url = icon;
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      const domain = new URL(url).hostname;
      setIcon(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
    } catch (error) {
      console.error("Invalid URL:", error);
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
    if (!showPreview) {
      setTimeout(() => {
        setShowPreview(false);
      }, duration);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="modal modal-open">
        <div className="modal-box relative max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium text-lg">
              {isEditing ? "Edit Message" : "Add New Message"}
            </h2>
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
              <FaTimes />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="form-control">
                <label htmlFor="title" className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., New Customer"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="form-control">
                <label htmlFor="content" className="label">
                  <span className="label-text">Message Content</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="e.g., Just purchased your product!"
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Icon</span>
                </label>
                <div className="tabs tabs-boxed mb-2">
                  <button 
                    type="button"
                    className={`tab ${activeTab === "url" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("url")}
                  >
                    Custom URL
                  </button>
                  <button 
                    type="button"
                    className={`tab ${activeTab === "popular" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("popular")}
                  >
                    Popular Icons
                  </button>
                </div>
                {activeTab === "url" ? (
                  <div className="join">
                    <input
                      type="text"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      placeholder="Enter URL or domain name"
                      className="input input-bordered join-item flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleFetchFavicon}
                      className="btn join-item"
                      title="Fetch favicon from domain"
                    >
                      <FaImage />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-2">
                    {POPULAR_ICONS.map((popularIcon, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setIcon(popularIcon.url)}
                        className={`btn btn-ghost h-auto aspect-square p-2 ${
                          icon === popularIcon.url ? "btn-active" : ""
                        }`}
                        title={popularIcon.name}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <img 
                            src={popularIcon.url} 
                            alt={popularIcon.name}
                            className="w-8 h-8 object-contain"
                          />
                          <div className="text-xs truncate">{popularIcon.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {icon && (
                  <div className="mt-2 flex items-center">
                    <span className="label-text mr-2">Preview:</span>
                    <div className="w-8 h-8 border border-base-content/20 rounded-btn flex items-center justify-center bg-base-200">
                      <img src={icon} alt="Icon preview" className="max-w-full max-h-full" />
                    </div>
                  </div>
                )}
              </div>
              <div className="form-control">
                <label htmlFor="duration" className="label">
                  <span className="label-text flex items-center gap-2">
                    <FaClock /> Duration (seconds)
                  </span>
                </label>
                <input
                  type="range"
                  id="duration"
                  min="1000"
                  max="15000"
                  step="1000"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="range"
                />
                <div className="flex justify-between text-xs text-base-content/60">
                  <span>1s</span>
                  <span>{duration / 1000}s</span>
                  <span>15s</span>
                </div>
              </div>
              <div className="alert shadow-lg">
                <button 
                  type="button" 
                  onClick={togglePreview}
                  className="btn btn-sm btn-ghost normal-case flex items-center gap-2"
                >
                  <FaPlay /> 
                  {showPreview ? "Preview Running..." : "Preview This Notification"}
                </button>
              </div>
              {showPreview && (
                <div className="card bg-base-200 shadow-lg">
                  <div className="card-body">
                    <div className="flex items-start gap-3">
                      {icon && (
                        <div className="w-10 h-10 rounded-btn overflow-hidden flex items-center justify-center bg-base-100">
                          <img src={icon} alt={title} className="max-w-full max-h-full" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{title || "Notification Title"}</h3>
                        <p className="text-sm opacity-70">{content || "Your message will appear here"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="modal-action">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  {isEditing ? "Update Message" : "Save Message"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}