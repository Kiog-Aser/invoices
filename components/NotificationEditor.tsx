"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image"; // Add Next Image import
import { Notification } from "@/models/Notification";
import ImageSelectorPopup from "./ImageSelectorPopup";

// Add missing interface
interface NotificationEditorProps {
  onSave: (notification: Notification) => void;
  initialData?: Notification;
}

export default function NotificationEditor({ onSave, initialData }: NotificationEditorProps) {
  // Add proper state
  const [notification, setNotification] = useState<Notification>(initialData || {
    title: "",
    message: "",
    image: "",
    timestamp: "now",
    delay: 0,
    url: ""
  });

  return (
    <div className="notification-editor">
      {/* Your editor content */}
      <form onSubmit={(e) => {
        e.preventDefault();
        onSave(notification);
      }}>
        {/* Add your form fields */}
      </form>
    </div>
  );
}