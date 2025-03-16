"use client";

import React, { useState, useEffect } from "react";
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

  const [isPro, setIsPro] = useState(false); // Add state for pro feature
  const [config, setConfig] = useState({ theme: 'default', loop: false, showCloseButton: true });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");

  useEffect(() => {
    // Reset pro features if user downgrades
    if (!isPro) {
      setConfig(prev => ({
        ...prev,
        theme: 'ios',
        loop: false,
        showCloseButton: false
      }));
      
      // Remove URLs from notifications
      setNotifications(prev => 
        prev.map(note => ({
          ...note,
          url: ''
        }))
      );
    }
  }, [isPro]);

  const handleThemeChange = (theme: string) => {
    if (!isPro) {
      setUpgradeFeature("custom themes");
      setShowUpgradeModal(true);
      return;
    }
    setConfig(prev => ({ ...prev, theme }));
  };

  const handleLoopChange = (loop: boolean) => {
    if (!isPro) {
      setUpgradeFeature("loop functionality");
      setShowUpgradeModal(true);
      return;
    }
    setConfig(prev => ({ ...prev, loop }));
  };

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