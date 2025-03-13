"use client";
import React, { useEffect, useState } from "react";
import { Notification } from "@/models/Notification";

// Extended interface for notifications with UI-specific properties
interface ExtendedNotification extends Notification {
  duration?: number;
  position?: string;
  body?: string;
  icon?: string;
}

interface IOSNotificationProps {
  notification: ExtendedNotification;
  onClose?: () => void;
  isPreview?: boolean;
}

export default function IOSNotification({ notification, onClose, isPreview = false }: IOSNotificationProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, isPreview ? 4000 : notification.duration || 5000); // Add default 5000ms if duration not specified
    
    return () => clearTimeout(timer);
  }, [notification, isPreview]);
  
  const handleClose = () => {
    setIsLeaving(true);
    
    setTimeout(() => {
      if (onClose) onClose();
    }, 500); // Animation duration
  };
  
  // Position calculation based on notification.position with default
  const positionClass = (notification.position || "bottom") === "top" 
    ? "top-4" 
    : "bottom-4";
    
  return (
    <div 
      className={`fixed z-50 left-1/2 transform -translate-x-1/2 transition-all duration-500 ease-in-out ${positionClass} ${
        isLeaving ? "opacity-0 translate-y-[-20px]" : "opacity-100 translate-y-0"
      } md:translate-x-0 md:left-auto md:right-8 max-w-sm w-full`} // Modified line
    >
      <div 
        onClick={handleClose}
        className={`cursor-pointer bg-base-100 rounded-box shadow-lg max-w-sm w-full transform transition-transform ${
          // Add slide down animation for mobile
          typeof window !== 'undefined' && window.innerWidth < 768 
            ? 'animate-slide-down origin-top' 
            : ''
        }`}
      >
        <div className="p-4">
          <div className="flex items-start">
            {notification.icon && (
              <div className="w-8 h-8 rounded-btn overflow-hidden flex items-center justify-center bg-base-200 mr-3">
                <img src={notification.icon} alt="" className="max-w-full max-h-full" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-base-content">
                {notification.title}
              </div>
              <div className="text-sm text-base-content/70 mt-1 break-words">
                {notification.body || notification.message}
              </div>
            </div>
            
            {isPreview && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="btn btn-ghost btn-circle btn-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}