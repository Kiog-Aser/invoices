"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaPlus, FaCopy, FaImage, FaGripVertical, FaPlay, FaStop, FaTimes, FaUpload, FaTrash, FaLink } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ButtonCheckout from "@/components/ButtonCheckout";
import { useSession, signOut } from "next-auth/react";
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Popular brand logos
const POPULAR_LOGOS = [
  { name: "Stripe", url: "https://cdn.iconscout.com/icon/free/png-256/free-stripe-2-498440.png" },
  { name: "PayPal", url: "https://cdn.iconscout.com/icon/free/png-256/free-paypal-54-675727.png" },
  { name: "Gmail", url: "https://cdn.iconscout.com/icon/free/png-256/free-gmail-2981844-2476484.png" },
  { name: "Facebook", url: "https://cdn.iconscout.com/icon/free/png-256/free-facebook-263-721950.png" },
  { name: "Twitter", url: "https://cdn.iconscout.com/icon/free/png-256/free-twitter-241-721979.png" },
  { name: "Instagram", url: "https://cdn.iconscout.com/icon/free/png-256/free-instagram-1868978-1583142.png" },
  { name: "LinkedIn", url: "https://cdn.iconscout.com/icon/free/png-256/free-linkedin-162-498418.png" },
  { name: "YouTube", url: "https://cdn.iconscout.com/icon/free/png-256/free-youtube-85-226402.png" },
];

interface Notification {
  id: string;
  title: string;
  message: string;
  image?: string;
  timestamp: string;
  delay: number;
  url?: string;
  pushDown?: boolean;  // Add this property for animation support
}

export default function NotificationSettings({ params }: { params: { websiteId: string } }) {
  const { data: session } = useSession();
  const websiteId = params.websiteId;
  const [isLoading, setIsLoading] = useState(true);
  const [website, setWebsite] = useState({ domain: "" });
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]); 
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [config, setConfig] = useState({
    startDelay: 500,
    displayDuration: 30000,
    cycleDuration: 3000,
    maxVisibleNotifications: 5
  });
  
  // Add looping state (add this with the other state declarations)
  const [loopNotifications, setLoopNotifications] = useState(false);
  
  // Image selector popup state
  const [imagePopupOpen, setImagePopupOpen] = useState(false);
  const [activeImageNotificationId, setActiveImageNotificationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "popular">("upload");
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const playerInterval = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const notificationIndex = useRef(0);
  const MAX_VISIBLE_NOTIFICATIONS = 5; // Change from 3 to 5

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Add a new state for close button visibility (add with other state declarations)
  const [showCloseButton, setShowCloseButton] = useState(false);

  // Add these new state variables
  const [isPro, setIsPro] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string>("");

  // Add new state for URL modal (with the other state declarations)
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [activeUrlNotificationId, setActiveUrlNotificationId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState("");

  // Add near other state declarations
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("ios"); // ios is default theme

  // Add these theme options
  const THEMES = [
    { 
      id: "ios", 
      name: "iOS Style", 
      class: "rounded-2xl bg-neutral-400/20 backdrop-blur-lg shadow-xl border border-white/20"
    },
    { 
      id: "modern", 
      name: "Modern Light", 
      class: "rounded-xl bg-white shadow-lg border border-primary/10" 
    },
    { 
      id: "dark", 
      name: "Modern Dark", 
      class: "rounded-xl bg-neutral text-neutral-content shadow-lg border border-white/10" 
    },
    { 
      id: "minimal", 
      name: "Minimal", 
      class: "rounded-md bg-base-100 shadow-sm border-l-4 border-primary" 
    },
    { 
      id: "glass", 
      name: "Glassmorphism", 
      class: "rounded-lg bg-white/40 backdrop-blur-md border border-white/30 shadow-xl" 
    },
    { 
      id: "colorful", 
      name: "Colorful", 
      class: "rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg" 
    }
  ];

  const [hasSeenTour, setHasSeenTour] = useState(() => {
    // Initialize state with localStorage value if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`tour-seen-${params.websiteId}`) === 'true';
    }
    return false;
  });
  
  useEffect(() => {
    if (!hasSeenTour && notifications.length === 0) {
      const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          classes: 'shadow-xl bg-base-100 rounded-lg',
          modalOverlayOpeningPadding: 4,
          arrow: false,
          cancelIcon: {
            enabled: false
          },
          when: {
            show: () => {
              // Apply DaisyUI styling to tour elements
              document.querySelectorAll('.shepherd-modal-overlay').forEach(overlay => {
                overlay.classList.add('bg-base-content/20', 'backdrop-blur-sm');
              });

              document.querySelectorAll('.shepherd-element').forEach(element => {
                element.classList.add('bg-base-100', 'shadow-xl', 'rounded-lg', 'border', 'border-base-300');
              });

              document.querySelectorAll('.shepherd-content').forEach(content => {
                content.classList.add('bg-base-100', 'rounded-lg');
              });

              document.querySelectorAll('.shepherd-text').forEach(text => {
                text.classList.add('p-6', 'text-base-content', 'prose', 'prose-sm', 'max-w-none');
              });

              document.querySelectorAll('.shepherd-footer').forEach(footer => {
                footer.classList.add('p-4', 'border-t', 'border-base-200', 'flex', 'justify-end', 'gap-2', 'bg-base-100');
              });

              document.querySelectorAll('.shepherd-button').forEach(button => {
                button.classList.add('btn', 'btn-primary');
                if (button.textContent?.includes('Next') || button.textContent?.includes('Finish')) {
                  button.classList.add('btn-primary');
                } else {
                  button.classList.add('btn-ghost');
                }
              });
            }
          }
        }
      });

      tour.addStep({
        id: 'add-notification',
        text: 'Start by adding your first notification here',
        attachTo: { element: '.btn-add-notification', on: 'bottom' },
        buttons: [{ 
          text: 'Next',
          classes: 'btn btn-primary',
          action: () => tour.next()
        }]
      });

      tour.addStep({
        id: 'theme',
        text: 'Customize the look of your notifications with different themes',
        attachTo: { element: '.btn-theme', on: 'bottom' },
        buttons: [{ 
          text: 'Next',
          classes: 'btn btn-primary btn-sm',
          action: () => tour.next()
        }]
      });

      tour.addStep({
        id: 'settings',
        text: 'Configure timing and behavior settings here',
        attachTo: { element: '.settings-panel', on: 'right' },
        buttons: [{ 
          text: 'Next',
          classes: 'btn btn-primary btn-sm',
          action: () => tour.next()
        }]
      });

      tour.addStep({
        id: 'preview',
        text: 'Preview your notifications before going live',
        attachTo: { element: '.btn-preview', on: 'bottom' },
        buttons: [{ 
          text: 'Next',
          classes: 'btn btn-primary btn-sm',
          action: () => tour.next()
        }]
      });

      tour.addStep({
        id: 'integration',
        text: 'Finally, copy this code to add notifications to your website',
        attachTo: { element: '.integration-code', on: 'top' },
        buttons: [{ 
          text: 'Finish',
          classes: 'btn btn-primary btn-sm',
          action: () => {
            tour.complete();
            setHasSeenTour(true);
            localStorage.setItem(`tour-seen-${params.websiteId}`, 'true');
          }
        }]
      });

      tour.start();
      
      // Set hasSeenTour in localStorage only after tour starts
      localStorage.setItem(`tour-seen-${params.websiteId}`, 'true');
      setHasSeenTour(true);
    }
  }, [notifications, params.websiteId, hasSeenTour]);

  // Convert ms to s for display
  const msToS = (ms: number) => ms / 1000;
  const sToMs = (s: number) => s * 1000;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch from database
        const response = await fetch(`/api/website-notifications/${params.websiteId}`);
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications?.map((notification: Notification) => ({
            ...notification,
            url: notification.url || ""
          })) || []);
          
          // Update config and pro settings
          if (data.config) {
            setConfig({
              startDelay: data.config.startDelay || 500,
              displayDuration: data.config.displayDuration || 30000,
              cycleDuration: data.config.cycleDuration || 3000,
              maxVisibleNotifications: data.config.maxVisibleNotifications || 5
            });
            // Only handle config settings when in pro
            if (session?.user?.plan === 'pro') {
              setSelectedTheme(data.config.theme || "ios");
              setLoopNotifications(data.config.loop === true);
              setShowCloseButton(data.config.showCloseButton === true);
            } else {
              setSelectedTheme("ios");
              setLoopNotifications(false);
              setShowCloseButton(false);
            }
          }
        } else {
          toast.error("Failed to load notifications");
        }

        // Check if user is on a Pro plan
        if (session?.user?.plan === 'pro') {
          setIsPro(true);
        } else {
          // Fallback to API check
          const userResponse = await fetch('/api/user');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setIsPro(userData.plan === 'pro');
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load saved settings");
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params.websiteId, session]);

  useEffect(() => {
    // Clean up interval when component unmounts
    return () => {
      if (playerInterval.current) {
        clearInterval(playerInterval.current);
      }
    };
  }, []);

  const saveNotifications = async () => {
    try {
      const response = await fetch(`/api/website-notifications/${params.websiteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          notifications: notifications.map(note => ({
            ...note,
            url: note.url || ""
          })),
          config: {
            ...config,
            loop: isPro ? loopNotifications : false,
            showCloseButton: isPro ? showCloseButton : false,
            theme: isPro ? selectedTheme : "ios"
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save notifications');
      }

      toast.success('Notifications saved successfully');
      setHasChanges(false);
      setConfigChanged(false);
    } catch (error) {
      console.error('Error saving notifications:', error);
      toast.error(error.message || 'Failed to save notifications');
    }
  };

  // Add config change tracking
  const [configChanged, setConfigChanged] = useState(false);

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig({
      ...config,
      [name]: sToMs(parseFloat(value))
    });
    setConfigChanged(true);
  };

  // Update loop and close button handlers
  const handleLoopChange = () => {
    if (!isPro && !loopNotifications) {
      setUpgradeFeature("loop notifications");
      setShowUpgradeModal(true);
      return;
    }
    
    setLoopNotifications(!loopNotifications);
    setConfigChanged(true);
  };

  const handleCloseButtonChange = () => {
    if (!isPro && !showCloseButton) {
      setUpgradeFeature("close button");
      setShowUpgradeModal(true);
      return;
    }
    
    setShowCloseButton(!showCloseButton);
    setConfigChanged(true);
  };

  const handleAddNotification = () => {
    // Check if free user already has 5 notifications
    if (!isPro && notifications.length >= 5) {
      setUpgradeFeature("additional notifications");
      setShowUpgradeModal(true);
      return;
    }
    
    const newNotification = {
      id: `note-${Date.now()}`,
      title: "",
      message: "",
      timestamp: "",
      delay: 0,
      image: "",
      url: "" // Add empty url field
    };
    
    setNotifications([...notifications, newNotification]);
    setHasChanges(true);
  };
  
  const handleNotificationChange = (id: string, field: string, value: string | number) => {
    setNotifications(notifications.map(note => 
      note.id === id ? { ...note, [field]: value } : note
    ));
    setHasChanges(true);
  };

  // Modified image upload handler - opens the popup instead
  const handleImageUpload = (id: string) => {
    setActiveImageNotificationId(id);
    setImagePopupOpen(true);
    setActiveTab("upload");
    setUploadPreviewUrl("");
  };

  // New function for handling file selection within the popup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setUploadPreviewUrl(event.target.result);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop for the file upload area
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
        if (event.target && typeof event.target.result === 'string') {
          setUploadPreviewUrl(event.target.result);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Function to select an image from the popup
  const selectImage = (imageUrl: string) => {
    if (activeImageNotificationId) {
      setNotifications(notifications.map(note => 
        note.id === activeImageNotificationId ? { ...note, image: imageUrl } : note
      ));
      setImagePopupOpen(false);
      setActiveImageNotificationId(null);
      setUploadPreviewUrl("");
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(notifications);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setNotifications(items);
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDropNotification = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const draggedItemContent = notifications[dragItem.current];
      const newNotifications = [...notifications];
      
      // Remove the dragged item
      newNotifications.splice(dragItem.current, 1);
      
      // Add it at the new position
      newNotifications.splice(dragOverItem.current, 0, draggedItemContent);
      
      // Update the state with new order
      setNotifications(newNotifications);
      
      // Reset the reference values
      dragItem.current = null;
      dragOverItem.current = null;
    }
  };
  
  const copyEmbedCode = () => {
    const embedCode = generateEmbedScript();
    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied to clipboard");
  };

  const togglePlay = () => {
    if (notifications.length === 0) {
      toast.error("Add at least one notification before starting the preview");
      return;
    }

    if (isPlaying) {
      // Stop the preview
      if (playerInterval.current) {
        clearInterval(playerInterval.current);
        playerInterval.current = null;
      }
      setIsPlaying(false);
      setActiveNotifications([]); // Clear all active notifications
    } else {
      // Start the preview
      setIsPlaying(true);
      notificationIndex.current = 0;
      
      // Initial delay before showing the first notification
      setTimeout(() => {
        displayNextNotification();
        
        // Set interval to cycle through notifications
        playerInterval.current = setInterval(() => {
          displayNextNotification();
        }, config.cycleDuration);
      }, config.startDelay);
    }
  };

  // Updated to add notifications to a stack instead of replacing
  const displayNextNotification = () => {
    if (notifications.length === 0) return;
    
    // Check if we've shown all notifications and loop is off
    if (!loopNotifications && notificationIndex.current >= notifications.length) {
      // Stop the preview if we've shown all notifications and not looping
      if (playerInterval.current) {
        clearInterval(playerInterval.current);
        playerInterval.current = null;
      }
      setIsPlaying(false);
      return;
    }
    
    const index = notificationIndex.current % notifications.length;
    const notification = {
      ...notifications[index],
      // Add a unique display ID to ensure React can properly track this instance
      id: `display-${notifications[index].id}-${Date.now()}`
    };
    
    // Add new notification to the beginning of the array (top of stack)
    setActiveNotifications(prev => {
      // Add push-down class to existing notifications
      const existingWithPushDown = prev.map(n => ({
        ...n,
        pushDown: true
      }));
      
      // Respect maxVisibleNotifications setting for desktop, but always 1 for mobile
      const maxVisible = window.innerWidth <= 768 ? 1 : (isPro ? config.maxVisibleNotifications : 1);
      const limitedPrev = existingWithPushDown.slice(0, maxVisible - 1);
      
      // Add new notification at the beginning
      return [{...notification, pushDown: false}, ...limitedPrev];
    });
    
    // Auto hide after display duration
    setTimeout(() => {
      setActiveNotifications(prev => {
        const filtered = prev.filter(note => note.id !== notification.id);
        // Remove push-down class from remaining notifications
        return filtered.map(n => ({...n, pushDown: false}));
      });
    }, config.displayDuration);
    
    notificationIndex.current += 1;
  };

  // Add this function to generate the embed code
  const generateEmbedScript = () => {
    return `<script defer data-website-id="${websiteId}" src="https://www.notifast.fun/js/embed.js"></script>`;
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // Update UI immediately for better user experience
      setNotifications(notifications.filter(n => n.id !== notificationId));
      setHasChanges(true);
      
      // Only attempt to delete from database if it was already saved
      // Check if it's a new notification that hasn't been saved yet (has a temporary ID)
      if (!notificationId.startsWith('note-')) {
        const response = await fetch(`/api/website-notifications/${params.websiteId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: notificationId })
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Error deleting from database:', error);
          // Don't throw error since we've already updated the UI
        } else {
          toast.success('Notification deleted successfully');
        }
      } else {
        toast.success('Notification removed');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Note: We don't revert the UI change even if there's an error
      // since the notification is already removed from the user's view
    }
  };

  const refreshSession = async () => {
    try {
      // Get latest user data
      const response = await fetch('/api/refresh-session');
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update session with the new data
        const result = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: data.user })
        });
        
        // Force reload to apply changes
        router.refresh();
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Add this function after the other handler functions
  const handleUrlEdit = (notification: Notification) => {
    if (!isPro) {
      setUpgradeFeature("custom notification URLs");
      setShowUpgradeModal(true);
      return;
    }
    
    setActiveUrlNotificationId(notification.id);
    setEditingUrl(notification.url || "");
    setUrlModalOpen(true);
  };

  const saveUrl = () => {
    if (activeUrlNotificationId) {
      setNotifications(notifications.map(note => 
        note.id === activeUrlNotificationId ? { ...note, url: editingUrl } : note
      ));
      setUrlModalOpen(false);
      setActiveUrlNotificationId(null);
      setEditingUrl("");
      setHasChanges(true);
    }
  };

  // Add this handler function
  const saveTheme = async () => {
    try {
      const response = await fetch(`/api/website-notifications/${params.websiteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notifications,
          config: {
            ...config,
            loop: loopNotifications,
            showCloseButton,
            theme: selectedTheme
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save theme');
      }

      toast.success('Theme saved successfully');
      setThemeModalOpen(false);
    } catch (error) {
      console.error('Error saving theme:', error);
      toast.error('Failed to save theme');
    }
  };

  // Add new state for logout countdown
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  // Check URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setShowLogoutModal(true);
      startLogoutCountdown();
    }
  }, []);

  const startLogoutCountdown = () => {
    let count = 10;
    setCountdown(count);
    
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(timer);
        signOut({ callbackUrl: '/auth/signin' });
      }
    }, 1000);
  };

  // Add this before the return statement
  if (showLogoutModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="modal-box text-center p-6">
          <h3 className="font-bold text-lg mb-4">Almost there! 🎉</h3>
          <p className="mb-4">
            To activate your Pro features, you need to log out and back in.
            You will be automatically logged out in:
          </p>
          <p className="text-4xl font-bold text-primary mb-6">{countdown}</p>
          <p className="text-sm text-base-content/70">
            You will be redirected to the login page.
          </p>
        </div>
      </div>
    );
  }

  // Add near your other styles
  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <header className="border-b border-base-200 bg-base-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={router.back}
            className="btn btn-ghost btn-sm gap-2"
          >
            <FaArrowLeft className="text-base-content" size={12} /> <span>Back</span>
          </button>

          <button
            onClick={() => {
              if (!isPro) {
                setUpgradeFeature("custom themes");
                setShowUpgradeModal(true);
                return;
              }
              setThemeModalOpen(true);
            }}
            className="btn btn-ghost btn-sm gap-2 btn-theme"
          >
            <span>Theme</span>
          </button>

          <button
            onClick={togglePlay}
            className={`btn btn-sm gap-2 btn-preview ${
              isPlaying 
                ? "btn-error" 
                : "btn-primary"
            }`}
          >
            {isPlaying ? (
              <>
                <FaStop size={12} /> Stop Preview
              </>
            ) : (
              <>
                <FaPlay size={12} /> Preview
              </>
            )}
          </button>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Configuration */}
          <div className="md:w-2/5 settings-panel">
            <div className="mb-6">
              <h2 className="text-primary font-medium text-sm mb-2">{website.domain}</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="startDelay" className="label">
                    <span className="label-text">Start notifications after (seconds)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="startDelay"
                    name="startDelay"
                    value={msToS(config.startDelay)}
                    onChange={handleConfigChange}
                    className="input input-bordered w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="cycleDuration" className="label">
                    <span className="label-text">Send message every (seconds)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="cycleDuration"
                    name="cycleDuration"
                    value={msToS(config.cycleDuration)}
                    onChange={handleConfigChange}
                    className="input input-bordered w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="displayDuration" className="label">
                    <span className="label-text">Hide message after (seconds)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="displayDuration"
                    name="displayDuration"
                    value={msToS(config.displayDuration)}
                    onChange={handleConfigChange}
                    className="input input-bordered w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="maxVisibleNotifications" className="label">
                    <span className="label-text flex items-center">
                      Max visible notifications
                      {!isPro && (
                        <span className="ml-2 badge badge-sm badge-outline badge-primary">PRO</span>
                      )}
                    </span>
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="\d*"
                    id="maxVisibleNotifications"
                    name="maxVisibleNotifications"
                    value={isPro ? config.maxVisibleNotifications : 1}
                    onChange={handleConfigChange}
                    className="input input-bordered w-full"
                    min="1"
                    max="10"
                    disabled={!isPro}
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/70">Mobile devices will always show 1 notification</span>
                  </label>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <label htmlFor="loopToggle" className="flex-1 label-text flex items-center">
                    Loop notifications
                    {!isPro && (
                      <span className="ml-2 badge badge-sm badge-outline badge-primary">PRO</span>
                    )}
                  </label>
                  <input
                    type="checkbox"
                    id="loopToggle"
                    checked={loopNotifications}
                    onChange={handleLoopChange}
                    className="toggle toggle-primary"
                    disabled={!isPro && !loopNotifications}
                  />
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <label htmlFor="closeButtonToggle" className="flex-1 label-text flex items-center">
                    Show close button
                    {!isPro && (
                      <span className="ml-2 badge badge-sm badge-outline badge-primary">PRO</span>
                    )}
                  </label>
                  <input
                    type="checkbox"
                    id="closeButtonToggle"
                    checked={showCloseButton}
                    onChange={handleCloseButtonChange}
                    className="toggle toggle-primary"
                    disabled={!isPro && !showCloseButton}
                  />
                </div>
                
                <div className="flex justify-end pt-2">
                  <button
                    onClick={saveNotifications}
                    disabled={!configChanged}
                    className="btn btn-primary btn-sm"
                  >
                    Update settings
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Notifications */}
          <div className="md:w-3/5">
            <div className="mb-6">
              <h2 className="text-primary font-medium text-sm mb-4">Notifications</h2>
              
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="notifications">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3 mb-4"
                    >
                      {notifications.map((notification, index) => (
                        <Draggable key={notification.id} draggableId={notification.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="card bg-base-200/90 backdrop-blur-sm shadow-sm notification-item relative"
                            >
                              <button
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="btn btn-ghost btn-xs btn-circle absolute bottom-2 right-2 text-base-content/30 hover:text-error"
                                title="Delete notification"
                              >
                                <FaTrash size={12} />
                              </button>

                              <div className="absolute bottom-2 right-10">
                                <button
                                  onClick={() => handleUrlEdit(notification)}
                                  className="btn btn-ghost btn-xs text-base-content/30 hover:text-primary"
                                  title={notification.url || "Add notification URL"}
                                >
                                  <span className="flex items-center gap-1">
                                    {notification.url ? (
                                      <>
                                        <FaLink size={12} />
                                        <span className="text-xs">Edit URL</span>
                                      </>
                                    ) : (
                                      <>
                                        <FaPlus size={10} />
                                        <span className="text-xs">Add URL</span>
                                      </>
                                    )}
                                  </span>
                                </button>
                              </div>

                              <div className="p-3">
                                <div className="flex items-start">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mr-2 flex items-center self-stretch cursor-grab text-base-content/30 hover:text-primary"
                                  >
                                    <FaGripVertical size={12} />
                                  </div>
                                  
                                  <div 
                                    className="mr-2.5 cursor-pointer relative group"
                                    onClick={() => handleImageUpload(notification.id)} 
                                  >
                                    <div className="w-8 h-8 bg-base-300 rounded-btn overflow-hidden flex items-center justify-center">
                                      {notification.image ? (
                                        <img 
                                          src={notification.image} 
                                          alt=""
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <FaImage className="text-base-content/30" size={14} />
                                      )}
                                    </div>
                                    <div className="absolute inset-0 bg-base-content/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-btn transition-opacity">
                                      <FaImage className="text-base-100" size={12} />
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                      <input
                                        type="text"
                                        value={notification.title}
                                        onChange={(e) => handleNotificationChange(notification.id, 'title', e.target.value)}
                                        className="input input-ghost input-sm p-0 w-3/5 truncate"
                                        placeholder="Notification title"
                                      />
                                      <input
                                        type="text"
                                        value={notification.timestamp}
                                        onChange={(e) => handleNotificationChange(notification.id, 'timestamp', e.target.value)}
                                        className="input input-ghost input-sm p-0 text-right w-2/5 text-primary/80 text-xs"
                                        placeholder="now"
                                      />
                                    </div>
                                    <input
                                      type="text"
                                      value={notification.message}
                                      onChange={(e) => handleNotificationChange(notification.id, 'message', e.target.value)}
                                      className="input input-ghost input-sm p-0 w-full text-base-content/70 text-xs"
                                      placeholder="Your message here"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              
              <button
                onClick={handleAddNotification}
                className="btn btn-primary w-full btn-add-notification"
              >
                <FaPlus size={12} className="mr-1.5" /> Message
              </button>
              
              {notifications.length > 0 && (
                <button
                  onClick={saveNotifications}
                  disabled={!hasChanges}
                  className="btn btn-primary w-full mt-4"
                >
                  Save notifications
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Section - Embed Script */}
        <div className="divider"></div>
        <div className="text-center">
          <h3 className="text-lg font-medium mb-1">Make your NotiFast live ✌️</h3>
          <p className="text-base-content/70 text-sm mb-4">Paste this snippet in the &lt;head&gt; of your website.</p>
          
          <div className="max-w-sm mx-auto">
            <div className="relative bg-base-200/50 rounded-2xl overflow-hidden group h-[72px] flex items-center integration-code">
              <pre className="px-4 text-left text-sm font-mono w-full">
                <code>{`<script defer data-website-id="${websiteId}" src="https://www.notifast.fun/js/embed.js"></script>`}</code>
              </pre>
                <button
                onClick={copyEmbedCode}
                className="absolute right-3 btn btn-primary btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Copy to clipboard"
                >
                <FaCopy size={15} />
                </button>
            </div>
            
            {notifications.length === 0 && (
              <div className="alert alert-warning mt-3 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>Add at least one message to make your NotiFast live</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Stacked notifications preview - updated mobile styles */}
      <div className="fixed top-24 md:right-8 max-w-xs w-full z-50 space-y-2 md:transform-none transform translate-x-[-50%] left-[50%] md:left-auto">
        {activeNotifications.map((notification, index) => (
          <div 
            key={notification.id} 
            className="relative" 
            style={{
              // On mobile, only show the first notification
              display: window.innerWidth <= 768 && index > 0 ? 'none' : 'block'
            }}
          >
            {showCloseButton && (
              <button 
                onClick={() => {
                  setActiveNotifications(prev => prev.filter(note => note.id !== notification.id));
                }}
                className="btn btn-circle btn-ghost btn-xs absolute -top-2 -left-2 z-10 bg-base-300/80 hover:bg-base-300"
                aria-label="Close notification"
              >
                <span className="text-xs">×</span>
              </button>
            )}
            
            <a
              href={notification.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`block ${notification.url ? 'cursor-pointer hover:scale-[1.02] transition-transform' : 'cursor-default'}`}
              onClick={(e) => {
                if (!notification.url) {
                  e.preventDefault();
                }
              }}
            >
              <div 
                className={`card transition-all duration-300 ${notification.pushDown ? 'animate-push-down' : 'animate-slide-in'} ${
                  THEMES.find(t => t.id === selectedTheme)?.class || THEMES[0].class
                }`}
                style={{
                  opacity: window.innerWidth <= 768 ? 1 : Math.max(0.85 - (index * 0.1), 0.6),
                  transform: window.innerWidth <= 768 
                    ? 'none' 
                    : `scale(${Math.max(1 - (index * 0.05), 0.9)})`,
                  transformOrigin: 'top right',
                  width: window.innerWidth <= 768 ? '90%' : 'auto',
                  margin: window.innerWidth <= 768 ? '0 auto' : undefined
                }}
              >
                <div className="p-3.5 flex">
                  {notification.image && (
                    <div className="w-10 h-10 rounded-btn overflow-hidden mr-3 flex-shrink-0">
                      <img
                        src={notification.image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="font-medium text-sm truncate">
                        {notification.title || "Notification Title"}
                      </h3>
                      <span className={`text-xs ml-1.5 whitespace-nowrap ${
                        selectedTheme === "ios" 
                          ? "text-black/70" 
                          : "text-primary/80"
                      }`}>
                        {notification.timestamp || "now"}
                      </span>
                    </div>
                    <p className="text-xs text-base-content/70 truncate">
                      {notification.message || "Your message here"}
                    </p>
                  </div>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
      
      {/* Image selector popup */}
      {imagePopupOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <div className="tabs tabs-boxed mb-4">
              <button
                className={`tab ${activeTab === "upload" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("upload")}
              >
                Upload Image
              </button>
              <button
                className={`tab ${activeTab === "popular" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("popular")}
              >
                Popular Logos
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "upload" ? (
                <div className="space-y-4">
                  {/* Upload area */}
                  <div 
                    className={`border-2 border-dashed rounded-box p-8 text-center cursor-pointer ${
                      isDragging ? "border-primary bg-primary/10" : "border-base-content/20 hover:border-primary"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FaUpload className="mx-auto h-10 w-10 text-base-content/40" />
                    <p className="mt-2 text-sm font-medium">
                      Drop image here or click to upload
                    </p>
                    <p className="mt-1 text-xs text-base-content/50">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  
                  {/* Preview */}
                  {uploadPreviewUrl && (
                    <div className="flex flex-col items-center space-y-3">
                      <img 
                        src={uploadPreviewUrl} 
                        alt="Preview" 
                        className="h-40 object-contain rounded-box"
                      />
                      <button
                        onClick={() => selectImage(uploadPreviewUrl)}
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
                      className="flex flex-col items-center p-3 rounded-box border cursor-pointer hover:border-primary hover:bg-primary/10 transition-all"
                      onClick={() => selectImage(logo.url)}
                    >
                      <img 
                        src={logo.url} 
                        alt={logo.name}
                        className="w-12 h-12 object-contain"
                      />
                      <span className="mt-2 text-sm text-center font-medium">{logo.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <label className="modal-backdrop" onClick={() => setImagePopupOpen(false)}></label>
        </div>
      )}
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes push-down {
          0% { 
            transform: translateY(0);
          }
          100% { 
            transform: translateY(2px);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-push-down {
          animation: push-down 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Hide spinner buttons for number inputs */
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type=number] {
          -moz-appearance: textfield;
        }
        
        .notification-item {
          cursor: grab;
        }
        
        .notification-item:active {
          cursor: grabbing;
        }
      `}</style>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="modal-box p-6 bg-base-100 rounded-box shadow-lg max-w-md">
            <h3 className="font-bold text-lg mb-4">Upgrade to Pro</h3>
            <p className="py-4">
              {upgradeFeature === "additional notifications" 
                ? "Free users can only create up to 5 notifications. Upgrade to Pro for unlimited notifications!" 
                : `The ${upgradeFeature} feature is only available for Pro users. Upgrade now to unlock this and other premium features!`
              }
            </p>
            <div className="modal-action flex justify-center gap-4">
              <button 
              className="btn btn-ghost" 
              onClick={() => setShowUpgradeModal(false)} 
               >
              Maybe Later
              </button>
              <ButtonCheckout
              priceId="price_1R0PNQIpDPy0JgwZ33p7CznT"
              mode="payment"
              successUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?success=true"}
              cancelUrl={`${typeof window !== 'undefined' ? window.location.href : ''}`+ "?canceled=true"}
              className="btn btn-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* URL modal */}
      {urlModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add Notification URL</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">URL (including https://)</span>
              </label>
              <input
                type="url"
                value={editingUrl}
                onChange={(e) => setEditingUrl(e.target.value)}
                placeholder="https://example.com"
                className="input input-bordered w-full"
              />
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setUrlModalOpen(false);
                  setActiveUrlNotificationId(null);
                  setEditingUrl("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={saveUrl}
                disabled={editingUrl !== "" && !editingUrl.startsWith('http')}
              >
                Save
              </button>
            </div>
          </div>
          <label className="modal-backdrop" onClick={() => setUrlModalOpen(false)}></label>
        </div>
      )}

      {/* Theme modal */}
      {themeModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Choose Notification Theme</h3>
            <div className="grid grid-cols-2 gap-4">
              {THEMES.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => {
                    if (!isPro) {
                      setUpgradeFeature("custom themes");
                      setShowUpgradeModal(true);
                      return;
                    }
                    setSelectedTheme(theme.id);
                  }}
                  className={`p-4 border rounded-box cursor-pointer transition-all hover:border-primary ${
                    selectedTheme === theme.id ? "border-primary bg-primary/5" : "border-base-200"
                  }`}
                >
                  {/* Theme preview */}
                  <div className={`p-3 mb-2 ${theme.class}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20" />
                      <div>
                        <div className="font-medium text-sm">Sample Title</div>
                        <div className="text-xs opacity-70">Sample notification message</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-sm font-medium">{theme.name}</div>
                </div>
              ))}
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-ghost" 
                onClick={() => setThemeModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={saveTheme}
              >
                Save Theme
              </button>
            </div>
          </div>
          <label className="modal-backdrop" onClick={() => setThemeModalOpen(false)}></label>
        </div>
      )}
    </div>
  );
}