"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image"; // Add Next Image import
import { Notification } from "@/models/Notification";
import ImageSelectorPopup from "@/components/ImageSelectorPopup";

interface NotificationEditorProps {
  onSave: (notification: Notification) => void;
  initialData?: Notification;
}

interface NotificationState extends Notification {
  showPreview?: boolean;
}

export default function NotificationEditor({ onSave, initialData }: NotificationEditorProps) {
  const [notification, setNotification] = useState<NotificationState>({
    title: "",
    body: "",
    duration: 5000,
    position: "top",
    image: "",
    icon: "",
    url: "",
    showPreview: false,
    ...initialData
  });

  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNotification({
      ...notification,
      [name]: name === "duration" ? parseInt(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notification.title.trim() || !notification.body.trim()) {
      toast.error("Title and message are required");
      return;
    }
    onSave(notification);
  };

  const handleImageSelect = (url: string) => {
    setNotification({ ...notification, image: url });
  };

  return (
    <div>
      <h2>{notification.id ? "Edit Notification" : "Create New Notification"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label className="label">
            <span className="label-text">App Name/Title</span>
          </label>
          <input
            type="text"
            name="title"
            value={notification.title}
            onChange={handleChange}
            className="input input-bordered"
            required
          />
        </div>

        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Message</span>
          </label>
          <textarea
            name="body"
            value={notification.body}
            onChange={handleChange}
            className="textarea textarea-bordered"
            required
          />
        </div>

        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Icon URL (optional)</span>
          </label>
          <input
            type="text"
            name="icon"
            value={notification.icon || ""}
            onChange={handleChange}
            className="input input-bordered"
            placeholder="https://example.com/icon.png"
          />
        </div>
        
        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Link URL (optional)</span>
          </label>
          <input
            type="text"
            name="url"
            value={notification.url || ""}
            onChange={handleChange}
            className="input input-bordered"
            placeholder="https://example.com"
          />
        </div>

        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Display Duration (ms)</span>
          </label>
          <input
            type="range"
            name="duration"
            value={notification.duration}
            onChange={handleChange}
            className="range"
            min="1000"
            max="15000"
            step="500"
            required
          />
          <div className="flex justify-between text-xs text-base-content/60 px-2">
            <span>1s</span>
            <span>{notification.duration / 1000}s</span>
            <span>15s</span>
          </div>
        </div>

        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Position</span>
          </label>
          <select
            name="position"
            value={notification.position}
            onChange={handleChange}
            className="select select-bordered"
            required
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>

      {notification.image && (
        <div className="mt-4 flex items-center gap-4">
          <Image 
            src={notification.image} 
            alt="Selected"
            width={64}
            height={64}
            className="w-16 h-16 object-cover rounded-box"
          />
        </div>
      )}

      {/* Preview section */}
      <div className="form-control mt-4">
        <label className="label cursor-pointer">
          <span className="label-text">Show Preview</span>
          <input
            type="checkbox"
            className="toggle"
            checked={notification.showPreview}
            onChange={(e) => setNotification({
              ...notification,
              showPreview: e.target.checked
            })}
          />
        </label>
      </div>

      {notification.showPreview && notification.icon && (
        <div className="mt-4">
          <div className="preview-container">
            <Image
              src={notification.icon}
              alt={notification.title || ""}
              width={32}
              height={32}
              className="preview-icon"
            />
            <div className="preview-content">
              <h4>{notification.title}</h4>
              <p>{notification.body}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="card-actions justify-end mt-6">
        <button type="submit" className="btn btn-primary">
          Save Notification
        </button>
      </div>
    </form>
  </div>
  
  <ImageSelectorPopup
    isOpen={isImageSelectorOpen}
    onClose={() => setIsImageSelectorOpen(false)}
    onSelect={handleImageSelect}
  />
</div>
  );
}